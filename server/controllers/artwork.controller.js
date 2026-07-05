const Artwork = require('../models/Artwork');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');
const { logActivity } = require('../utils/auditLogger');

// @desc    Create new artwork
// @route   POST /api/artworks
// @access  Artist only
exports.createArtwork = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      styleTags,
      medium,
      dimensions,
      price,
      currency,
      isLimitedEdition,
      totalEditions,
      saleType,
      resaleRoyalty,
      status,
      auction,
    } = req.body;

    // Build artwork data
    const artworkData = {
      title,
      description,
      artist: req.user._id,
      category,
      styleTags: styleTags ? (typeof styleTags === 'string' ? JSON.parse(styleTags) : styleTags) : [],
      medium,
      dimensions: dimensions ? (typeof dimensions === 'string' ? JSON.parse(dimensions) : dimensions) : {},
      price,
      currency: currency || 'INR',
      isLimitedEdition: isLimitedEdition === 'true' || isLimitedEdition === true,
      totalEditions: isLimitedEdition ? totalEditions : null,
      saleType: saleType || 'fixed',
      resaleRoyalty: resaleRoyalty || 10,
      status: status === 'published' ? 'pending' : (status || 'draft'),
    };

    // Handle auction fields
    if (saleType === 'auction' && auction) {
      artworkData.auction = typeof auction === 'string' ? JSON.parse(auction) : auction;
    }

    // Handle image upload if file is present
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'artvault/artworks');
      artworkData.images = uploadResult;
    }

    const artwork = await Artwork.create(artworkData);

    // Log administrative event
    await logActivity('artwork_created', `Artwork "${artwork.title}" created by artist ${req.user.name} (initial status: ${artwork.status})`, req.user._id);

    res.status(201).json({
      success: true,
      data: artwork,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all artworks (public — published only, preview URLs only)
// @route   GET /api/artworks
// @access  Public
exports.getArtworks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      style,
      minPrice,
      maxPrice,
      color,
      saleType,
      search,
      sort = '-createdAt',
      artist,
    } = req.query;

    const query = { status: 'published' };

    // Filters
    if (category) query.category = category;
    if (style) query.styleTags = { $in: style.split(',') };
    if (saleType) query.saleType = saleType;
    if (artist) query.artist = artist;
    if (color) query.dominantColor = { $regex: new RegExp(color, 'i') };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      const matchingArtists = await User.find({
        role: 'artist',
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const artistIds = matchingArtists.map(a => a._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { styleTags: { $regex: search, $options: 'i' } },
        { artist: { $in: artistIds } }
      ];
    }

    // Parse sort
    const sortObj = {};
    const sortFields = sort.split(',');
    sortFields.forEach((field) => {
      if (field.startsWith('-')) {
        sortObj[field.slice(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });

    const skip = (Number(page) - 1) * Number(limit);

    const [artworks, total] = await Promise.all([
      Artwork.find(query)
        .select('-images.original -gallery.original') // Never expose original URLs publicly
        .populate('artist', 'name profileImage isVerifiedArtist')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Artwork.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: artworks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single artwork (public — preview only)
// @route   GET /api/artworks/:id
// @access  Public
exports.getArtwork = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .select('-images.original -gallery.original')
      .populate('artist', 'name profileImage bio socialLinks isVerifiedArtist');

    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    res.status(200).json({
      success: true,
      data: artwork,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment view count
// @route   POST /api/artworks/:id/view
// @access  Public
exports.incrementView = async (req, res, next) => {
  try {
    await Artwork.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get artworks by logged-in artist (includes drafts, originals)
// @route   GET /api/artworks/my-artworks
// @access  Artist only
exports.getMyArtworks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { artist: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [artworks, total] = await Promise.all([
      Artwork.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Artwork.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: artworks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update artwork
// @route   PUT /api/artworks/:id
// @access  Owning artist or admin
exports.updateArtwork = async (req, res, next) => {
  try {
    let artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    // Only the owning artist or admin can update
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this artwork', 403));
    }

    // Handle image upload if new file present
    if (req.file) {
      // Delete old image from Cloudinary
      if (artwork.images?.publicId) {
        await deleteFromCloudinary(artwork.images.publicId);
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'artvault/artworks');
      req.body.images = uploadResult;
    }

    // Parse JSON strings from form data
    if (req.body.styleTags && typeof req.body.styleTags === 'string') {
      req.body.styleTags = JSON.parse(req.body.styleTags);
    }
    if (req.body.dimensions && typeof req.body.dimensions === 'string') {
      req.body.dimensions = JSON.parse(req.body.dimensions);
    }
    if (req.body.auction && typeof req.body.auction === 'string') {
      req.body.auction = JSON.parse(req.body.auction);
    }

    if (req.body.status === 'published' && req.user.role !== 'admin') {
      req.body.status = 'pending';
    }

    artwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Log event
    await logActivity('artwork_updated', `Artwork "${artwork.title}" updated (status: ${artwork.status})`, req.user._id);

    res.status(200).json({
      success: true,
      data: artwork,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete artwork
// @route   DELETE /api/artworks/:id
// @access  Owning artist or admin
exports.deleteArtwork = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    // Only the owning artist or admin can delete
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this artwork', 403));
    }

    // Delete image from Cloudinary
    if (artwork.images?.publicId) {
      await deleteFromCloudinary(artwork.images.publicId);
    }

    // Delete gallery images
    if (artwork.gallery?.length > 0) {
      for (const img of artwork.gallery) {
        if (img.publicId) await deleteFromCloudinary(img.publicId);
      }
    }

    await artwork.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Artwork deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related artworks (by category/style/color)
// @route   GET /api/artworks/:id/related
// @access  Public
exports.getRelatedArtworks = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    const related = await Artwork.find({
      _id: { $ne: artwork._id },
      status: 'published',
      $or: [
        { category: artwork.category },
        { styleTags: { $in: artwork.styleTags } },
        ...(artwork.dominantColor ? [{ dominantColor: artwork.dominantColor }] : []),
      ],
    })
      .select('-images.original -gallery.original')
      .populate('artist', 'name profileImage')
      .limit(6)
      .sort('-viewCount');

    res.status(200).json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report an artwork
// @route   POST /api/artworks/:id/report
// @access  Authenticated
exports.reportArtwork = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    artwork.reportCount += 1;
    artwork.flagReason = reason || 'Reported by user';

    // Auto-flag if report count exceeds threshold
    if (artwork.reportCount >= 3) {
      artwork.status = 'flagged';
    }

    await artwork.save();

    res.status(200).json({
      success: true,
      message: 'Artwork reported successfully',
    });
  } catch (error) {
    next(error);
  }
};

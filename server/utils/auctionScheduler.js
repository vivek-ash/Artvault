const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Periodically checks for ended auctions and processes the winners
 */
const startAuctionScheduler = (app) => {
  // Run every minute
  setInterval(async () => {
    try {
      const now = new Date();
      // Find published artworks where auction has ended
      const endedAuctions = await Artwork.find({
        saleType: 'auction',
        status: 'published',
        'auction.endTime': { $lte: now }
      }).populate('artist');

      if (endedAuctions.length === 0) return;

      console.log(`[Auction Scheduler] Processing ${endedAuctions.length} ended auctions...`);

      for (const artwork of endedAuctions) {
        const { currentBid, highestBidder, bidCount } = artwork.auction;

        if (bidCount > 0 && highestBidder) {
          // We have a winner!
          const winner = await User.findById(highestBidder);
          if (!winner) {
            console.error(`[Auction Scheduler] Winner user ${highestBidder} not found`);
            continue;
          }

          // Calculate fees
          const amount = currentBid;
          const platformFee = Math.round(amount * 0.1);
          const artistEarnings = amount - platformFee;

          // Create a pending order for the winning bidder
          const order = await Order.create({
            buyer: winner._id,
            artwork: artwork._id,
            artist: artwork.artist._id,
            amount,
            currency: 'INR',
            platformFee,
            artistEarnings,
            payment: {
              status: 'pending',
            },
          });

          // Mark artwork as sold out
          artwork.status = 'sold_out';
          await artwork.save();

          // Notify winner
          const winnerNotif = await Notification.create({
            recipient: winner._id,
            type: 'bid',
            title: 'Auction Won! 🏆',
            message: `Congratulations! You won the auction for "${artwork.title}" with a bid of ₹${amount.toLocaleString()}. Please complete the payment.`,
            relatedArtwork: artwork._id,
            relatedOrder: order._id,
          });

          // Notify artist
          const artistNotif = await Notification.create({
            recipient: artwork.artist._id,
            type: 'sale',
            title: 'Auction Ended (Sold) 💰',
            message: `Your auction for "${artwork.title}" has ended. Winner: ${winner.name} with a bid of ₹${amount.toLocaleString()}.`,
            relatedUser: winner._id,
            relatedArtwork: artwork._id,
            relatedOrder: order._id,
          });

          // Send real-time notifications
          const io = app.get('io');
          if (io) {
            io.to(winner._id.toString()).emit('notification', winnerNotif);
            io.to(artwork.artist._id.toString()).emit('notification', artistNotif);
          }

          console.log(`[Auction Scheduler] Resolved auction for "${artwork.title}" to winner ${winner.name} (₹${amount})`);
        } else {
          // No bids placed — return to draft so artist can relist
          artwork.status = 'draft';
          await artwork.save();

          // Notify artist
          const artistNotif = await Notification.create({
            recipient: artwork.artist._id,
            type: 'system',
            title: 'Auction Ended (No Bids) ℹ️',
            message: `Your auction for "${artwork.title}" ended with no bids. The artwork has been moved to drafts.`,
            relatedArtwork: artwork._id,
          });

          const io = app.get('io');
          if (io) {
            io.to(artwork.artist._id.toString()).emit('notification', artistNotif);
          }

          console.log(`[Auction Scheduler] Ended auction for "${artwork.title}" with no bids. Reset to draft.`);
        }
      }
    } catch (err) {
      console.error('[Auction Scheduler] Error processing ended auctions:', err.message);
    }
  }, 60000); // every 60 seconds
};

module.exports = startAuctionScheduler;

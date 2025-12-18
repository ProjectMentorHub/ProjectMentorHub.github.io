import { motion } from 'framer-motion';
import GoogleAd from './GoogleAd';
import { ADSENSE_SLOTS } from '../config/adsense';

const AdBanner = () => {
  if (!ADSENSE_SLOTS.leaderboard) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white border border-black/5 rounded-lg p-4">
            <GoogleAd
              adSlot={ADSENSE_SLOTS.leaderboard}
              className="mx-auto"
              style={{ width: '100%', minHeight: '120px' }}
              format="auto"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdBanner;

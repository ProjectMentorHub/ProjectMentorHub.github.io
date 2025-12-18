import { motion } from 'framer-motion';
import GoogleAd from './GoogleAd';
import { ADSENSE_SLOTS } from '../config/adsense';

const AdSidebar = () => {
  const hasTopAd = Boolean(ADSENSE_SLOTS.rectangleTop);
  const hasBottomAd = Boolean(ADSENSE_SLOTS.rectangleBottom);

  return (
    <aside className="hidden lg:block w-64">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="sticky top-24"
      >
        {/* Ad Container */}
        <div className="space-y-4">
          {hasTopAd && (
            <div className="bg-white border border-black/5 rounded-lg p-3">
              <GoogleAd
                adSlot={ADSENSE_SLOTS.rectangleTop}
                className="mx-auto"
                style={{ width: '100%', minHeight: '250px' }}
                format="auto"
              />
            </div>
          )}

          {hasBottomAd && (
            <div className="bg-white border border-black/5 rounded-lg p-3">
              <GoogleAd
                adSlot={ADSENSE_SLOTS.rectangleBottom}
                className="mx-auto"
                style={{ width: '100%', minHeight: '250px' }}
                format="auto"
              />
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white border border-black/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Need Help?</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@projectmentorhub.com" className="text-gray-600 hover:text-black transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="/journals" className="text-gray-600 hover:text-black transition-colors">
                  Journal Publishing
                </a>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};

export default AdSidebar;

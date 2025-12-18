import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import projects from '../data/projects';
import SEO from '../components/SEO';
import { getDisplayCategory } from '../utils/projectMetadata';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === id);
    setProject(foundProject || null);
    setLoading(false);
  }, [id]);

  const handleAddToCart = () => {
    if (!project) return;
    addToCart(project);
  };

  const handleBuyNow = () => {
    if (!project) return;
    navigate('/checkout', {
      state: {
        buyNowItems: [{ ...project, quantity: 1 }],
        source: 'buy-now'
      }
    });
  };

  const shortDescription = useMemo(() => {
    if (!project || !project.description) {
      return 'Premium academic project kit with documentation and source code.';
    }
    return project.description.length > 155
      ? `${project.description.slice(0, 155)}...`
      : project.description;
  }, [project]);

  const productSchema = useMemo(() => {
    if (!project) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: project.title,
      description: shortDescription,
      sku: project.id,
      category: getDisplayCategory(project),
      image: project.image || 'https://projectmentorhub.com/logo512.png',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: project.price,
        availability: 'https://schema.org/InStock',
        url: `https://projectmentorhub.com/project/${project.id}`
      }
    };
  }, [project, shortDescription]);

  const displayCategory = getDisplayCategory(project);
  const contactPhone = displayCategory === 'CSE' ? '+91 7207438246' : '+91 9392400166';
  const contactTel = contactPhone.replace(/\s+/g, '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <>
        <SEO
          title="Project Not Found"
          description="The project you are looking for is unavailable or has been removed."
          canonical={`https://projectmentorhub.com/project/${id}`}
          noIndex
        />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-gray-600">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
    <SEO
      title={project.title}
      description={`${project.title} – ${shortDescription}`}
      canonical={`https://projectmentorhub.com/project/${project.id}`}
      type="product"
      image={project.image}
      schema={productSchema}
    />
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-center"
          >
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-auto object-contain max-h-[600px]"
              />
            ) : (
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <span className="text-sm bg-black text-white px-3 py-1 inline-block mb-3">
                {displayCategory}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                {project.title}
              </h1>
              <p className="text-3xl font-bold mb-6">₹{project.price.toLocaleString()}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {project.features && project.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Features</h2>
                <ul className="space-y-2">
                  {project.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t border-black/10 space-y-3">
              <button onClick={handleAddToCart} className="w-full btn-primary text-lg py-4">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="w-full btn-secondary text-lg py-4">
                Buy Now
              </button>
            </div>

            <div className="pt-6 border-t border-black/10">
              <p className="text-sm text-gray-600">
                <strong>Includes:</strong> Complete project documentation, source code, and implementation guide
              </p>
            </div>

            <div className="p-4 bg-white border border-black/5 rounded-2xl">
              <p className="text-sm font-semibold text-gray-900">Need help with this project?</p>
              <p className="text-sm text-gray-600 mt-1">
                For {displayCategory === 'CSE' ? 'CSE projects' : 'other categories'}, reach us at{' '}
                <a href={`tel:${contactTel}`} className="font-semibold text-gray-900 hover:underline">
                  {contactPhone}
                </a>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProjectDetails;

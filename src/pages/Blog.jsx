import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, ArrowRight, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from '@/utils';
import { blogPosts } from '../components/blog/blogData';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [displayCount, setDisplayCount] = useState(6);

  const categories = ['All', 'Basics', 'Comparisons', 'Use Cases', 'Growth', 'Process', 'Industries'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedPosts = filteredPosts.slice(0, displayCount);
  const hasMore = filteredPosts.length > displayCount;

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Business Funding Insights</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Learn About Business Cash Advances
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Expert insights, practical guides, and real success stories to help you make informed funding decisions.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-full text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-[#08708E] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {!searchTerm && selectedCategory === 'All' && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#08708E]" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Article</h2>
            </div>

            <Link to={`${createPageUrl('BlogPost')}?slug=${featuredPost.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {featuredPost.image && (
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#08708E] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {featuredPost.category}
                    </span>
                    <span className="text-slate-500 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-[#08708E] transition-colors">
                    {featuredPost.title}
                  </h3>

                  <p className="text-slate-600 mb-6 line-clamp-3">
                    {featuredPost.metaDescription}
                  </p>

                  <div className="flex items-center gap-2 text-[#08708E] font-semibold">
                    Read Full Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No articles found matching your search.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {displayedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`${createPageUrl('BlogPost')}?slug=${post.slug}`}>
                      <div className="group bg-white rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                        {post.image && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={post.image} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                              {post.category}
                            </span>
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#08708E] transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
                            {post.metaDescription}
                          </p>

                          <div className="flex items-center gap-2 text-[#08708E] font-semibold text-sm">
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <Button 
                    onClick={() => setDisplayCount(prev => prev + 6)}
                    className="bg-[#08708E] hover:bg-[#065a72] px-8 py-6 text-lg rounded-full"
                  >
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#08708E] to-[#065a72]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Fund Your Business Growth?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Apply now and get funding in as little as 24 hours. No collateral required.
          </p>
          <Link to={createPageUrl('application')}>
            <Button className="bg-white text-[#08708E] hover:bg-white/90 px-8 py-6 text-lg rounded-full">
              Start Your Application
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
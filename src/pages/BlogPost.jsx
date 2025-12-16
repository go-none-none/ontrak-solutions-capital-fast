import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';
import { blogPosts } from '../components/blog/blogData';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Post Not Found</h1>
          <Link to={createPageUrl('Blog')}>
            <Button>Return to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Image */}
      {post.image && (
        <div className="relative h-[400px] bg-slate-900">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link to={createPageUrl('Blog')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-8"
        >
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-slate-600">
            <span className="bg-[#08708E] text-white px-3 py-1 rounded-full font-medium">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            {post.title}
          </h1>

          {/* Keywords */}
          {post.keywords && post.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Tag className="w-4 h-4 text-slate-400" />
              {post.keywords.map((keyword, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none">
            {post.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <p key={i} className="font-bold text-slate-900 my-4">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={i} className="list-disc pl-6 my-4 space-y-2">
                    {items.map((item, j) => (
                      <li key={j} className="text-slate-700">
                        {item.replace('- ', '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-slate-700 leading-relaxed my-4">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-white/90 mb-6">
                Apply now and get funding in as little as 24 hours.
              </p>
              <Link to={createPageUrl('application')}>
                <Button className="bg-white text-[#08708E] hover:bg-white/90 px-8 py-6 text-lg rounded-full">
                  Start Your Application
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`${createPageUrl('BlogPost')}?slug=${relatedPost.slug}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 h-full"
                  >
                    {relatedPost.image && (
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relatedPost.readTime}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp = () => {
    return (
        <motion.a
            href="https://wa.me/77072852369"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-hover hover:bg-green-600 transition-smooth animate-pulse-soft"
        >
            <MessageCircle className="w-9 h-9 text-white" />
        </motion.a>
    );
};

export default FloatingWhatsApp;

import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fade-in">
      <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl"></div>

        <h2 className="text-3xl md:text-5xl font-bold text-amber-900 mb-8 font-cinzel border-b border-amber-200 pb-4">
          About Hakuna Matata Sankofa.i
        </h2>

        <div className="space-y-8 text-stone-800 leading-relaxed text-lg">
          <section>
            <h3 className="text-2xl font-bold text-amber-800 mb-4 font-cinzel">Bridging Heritage and Innovation</h3>
            <p>
              Hakuna Matata Sankofa.i is more than just a platform; it is a digital bridge connecting the profound wisdom of African ancestry with the cutting-edge capabilities of modern Artificial Intelligence. Inspired by the Akan proverb "Sankofa" — which teaches us that it is not taboo to go back and fetch what we have forgotten — we utilize AI to preserve, analyze, and celebrate the rich cultural tapestry of the continent.
            </p>
          </section>

          <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 italic text-stone-700">
            <p className="mb-4">
              "The youth of Africa are the engine of the continent's transformation. By embracing our roots while mastering the tools of the future, we create a path that is uniquely ours."
            </p>
            <p className="text-right font-bold font-cinzel">— Inspired by the vision of African Leaders</p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-amber-800 mb-4 font-cinzel">The New Age Tech Ecosystem</h3>
            <p>
              The global tech ecosystem is evolving, and Africa is at the forefront of this shift. We believe that the most sustainable and impactful technological advancements occur when they are rooted in cultural context. By adapting traditional symbols, oral histories, and artistic patterns into digital formats, we ensure that our heritage doesn't just survive in the age of AI — it thrives.
            </p>
            <p className="mt-4">
              AI plays a pivotal role in this journey. It acts as a digital elder, capable of recognizing patterns in Adinkra symbols, transcribing oral histories in real-time, and generating new designs that respect ancient aesthetics while pushing modern boundaries.
            </p>
          </section>

          <section className="border-t border-amber-200 pt-8 mt-8">
            <h3 className="text-2xl font-bold text-amber-800 mb-4 font-cinzel">The Hakuna Matata Safari Marketplace</h3>
            <p>
              Our commitment to culture extends to the physical world. Through our 
              <a 
                href="https://hakuna-matata-nft-safari-marketplac.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-700 font-bold hover:underline mx-1"
              >
                Shop Page
              </a>, 
              users can explore the Hakuna Matata NFT Safari.
            </p>
            <div className="mt-6 bg-white/40 p-6 rounded-2xl border border-white/60 shadow-inner">
              <h4 className="font-bold text-amber-900 mb-2">Digital Doubles & Real-World Rewards</h4>
              <p className="text-sm md:text-base">
                Mint unique <strong>Digital Doubles</strong> of our exclusive Hakuna Matata Merch. These digital assets are not just collectibles; they are your ticket to the future of fashion. By holding a Digital Double, you secure <strong>exclusive discounts</strong> and early access when the physical Hakuna Matata merch line officially drops.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-4 opacity-60">
             <span className="text-3xl">🌍</span>
             <span className="text-3xl">🤖</span>
             <span className="text-3xl">🎨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

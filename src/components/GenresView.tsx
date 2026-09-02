import React, { useState } from 'react';
import { MediaItem } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { ArrowLeft } from 'lucide-react';

interface GenresViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
}

interface GenreArchivalCategory {
  name: string;
  description: string;
  count: number;
}

export const GenresView: React.FC<GenresViewProps> = ({
  items,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
  onSelectActor,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const allGenres: string[] = Array.from(new Set(items.flatMap((i) => i.genres))).sort() as string[];

  const genreDescriptions: Record<string, string> = {
    Action: 'Dynamic kinetic cinema, physical stunt choreography, and high-tension pursuits.',
    Adventure: 'Expeditions across unforgiving wilderness and historical frontier sagas.',
    Biography: 'Intimate historical portraits examining monumental figures and moral crossroads.',
    Comedy: 'Satirical humanism, sharp wit, and deadpan observations of societal absurdity.',
    Crime: 'Neo-noir atmospheric investigations, underworld syndicates, and municipal corruption.',
    Drama: 'Profound emotional realism, psychological depth, and complex human conditions.',
    Fantasy: 'Mythological realms, enchanted labyrinths, and surreal metaphysical tales.',
    History: 'Authentic period recreation capturing transformative cultural epochs.',
    Horror: 'Psychological terror, eerie atmospheric dread, and existential dread.',
    Mystery: 'Cryptic enigmas, procedural deductions, and labyrinthine conspiracies.',
    Romance: 'Transcendent longing, melancholic destiny, and tender intimate encounters.',
    'Sci-Fi': 'Speculative futures, memory modification, cosmic void, and mechanical philosophy.',
    Thriller: 'Visceral suspense, ticking clocks, and escalating psychological friction.',
    War: 'Brutal tactical confrontation and ethical dilemmas in times of conflict.',
  };

  const displayedItems = selectedGenre
    ? items.filter((item) => item.genres.includes(selectedGenre))
    : [];

  return (
    <div id="genres-view" className="py-8">
      {/* Section Masthead */}
      <div className="border-b-2 border-[#141414] pb-4 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
          SECTION 03 · CINEMATOGRAPHIC TAXONOMY & CLASSIFICATIONS
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
          <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414]">
            {selectedGenre ? `GENRE: ${selectedGenre.toUpperCase()}` : 'CINEMATIC GENRES'}
          </h1>
          {selectedGenre && (
            <button
              onClick={() => setSelectedGenre(null)}
              className="text-xs font-condensed uppercase tracking-wider font-bold text-[#141414] hover:text-[#57534E] flex items-center gap-1.5 cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO ALL GENRES</span>
            </button>
          )}
        </div>
        <p className="font-serif-editorial text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl">
          {selectedGenre
            ? genreDescriptions[selectedGenre] ||
              'Explore motion pictures classified under this thematic category.'
            : 'Explore the collection through traditional film movements, tonal styles, and thematic classifications.'}
        </p>
      </div>

      {/* When a specific genre is selected */}
      {selectedGenre ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-[#78716C] uppercase border-b border-[#141414]/15 pb-2">
            <span>
              CATALOGUED TITLES: <strong className="text-[#141414]">{displayedItems.length}</strong>
            </span>
            <span>NO SUBSCRIPTION REQUIRED</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {displayedItems.map((item) => (
              <EditorialMovieCard
                key={item.id}
                item={item}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                watchlist={watchlist}
                onToggleWatchlist={onToggleWatchlist}
                onSelectActor={onSelectActor}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Editorial Category Ledger */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {allGenres.map((genre) => {
            const count = items.filter((i) => i.genres.includes(genre)).length;
            const desc = genreDescriptions[genre] || 'Archival cinematic repertoire.';

            return (
              <div
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className="bg-[#F4F1EA] border border-[#141414]/30 hover:border-[#141414] p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#78716C] mb-2">
                    <span className="uppercase tracking-widest">CATEGORY</span>
                    <span className="font-bold text-[#141414] bg-[#E8E5DC] border border-[#141414]/20 px-2 py-0.5">
                      {count} {count === 1 ? 'WORK' : 'WORKS'}
                    </span>
                  </div>

                  <h2 className="font-condensed text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#141414] group-hover:text-[#57534E] transition-colors mb-2">
                    {genre}
                  </h2>

                  <p className="font-serif-editorial text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#141414]/15 flex items-center justify-between text-[11px] font-condensed uppercase tracking-wider font-bold text-[#141414] group-hover:translate-x-1 transition-transform">
                  <span>INSPECT CATEGORY</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

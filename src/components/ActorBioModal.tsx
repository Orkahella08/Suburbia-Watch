import React from 'react';
import { CastMember, MediaItem } from '../types';
import { X, Film, Star, Play } from 'lucide-react';

interface ActorBioModalProps {
  actorName: string | null;
  onClose: () => void;
  allMedia: MediaItem[];
  onOpenDetails: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

export const ActorBioModal: React.FC<ActorBioModalProps> = ({
  actorName,
  onClose,
  allMedia,
  onOpenDetails,
  onPlay,
}) => {
  if (!actorName) return null;

  // Find actor profile from media items
  let actorProfile: CastMember | undefined;
  for (const m of allMedia) {
    const found = m.cast.find(
      (c) => c.name.toLowerCase() === actorName.toLowerCase()
    );
    if (found) {
      actorProfile = found;
      break;
    }
  }

  // Find all films/shows in archive starring this actor
  const starredMedia = allMedia.filter((m) =>
    m.cast.some((c) => c.name.toLowerCase() === actorName.toLowerCase())
  );

  return (
    <div
      id="actor-bio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/85 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#E8E5DC] text-[#141414] border-2 border-[#141414] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-auto font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Archival Dossier Header */}
        <div className="flex items-center justify-between border-b-2 border-[#141414] pb-3 mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
            SUBURBIA ARCHIVE · TALENT DOSSIER
          </span>
          <button
            onClick={onClose}
            className="p-1 border border-[#141414] hover:bg-[#141414] hover:text-[#FAF9F6] transition-colors cursor-pointer"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actor Profile Head */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#141414] shrink-0 bg-[#141414] shadow-md">
            {actorProfile?.avatar ? (
              <img
                src={actorProfile.avatar}
                alt={actorName}
                className="w-full h-full object-cover film-photo-treatment"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-mono text-2xl">
                {actorName.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414] leading-none mb-1">
              {actorName}
            </h2>
            {actorProfile?.role && (
              <p className="font-mono text-xs text-[#57534E] uppercase tracking-wider mb-3">
                Featured Character: <strong className="text-[#141414]">{actorProfile.role}</strong>
              </p>
            )}
            <p className="font-serif-editorial text-sm text-[#141414] leading-relaxed">
              {actorProfile?.bio ||
                'Celebrated performer in the contemporary cinematic repertory, known for compelling leading roles and auteur collaborations.'}
            </p>
          </div>
        </div>

        {/* Known Works in Catalog */}
        <div className="border-t border-[#141414]/20 pt-4">
          <h3 className="font-condensed text-lg font-bold uppercase tracking-wider text-[#141414] mb-3">
            ARCHIVE REPERTOIRE ({starredMedia.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {starredMedia.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-[#F4F1EA] border border-[#141414]/30 hover:border-[#141414] flex items-center justify-between gap-3 transition-colors"
              >
                <div
                  className="cursor-pointer truncate"
                  onClick={() => {
                    onClose();
                    onOpenDetails(m);
                  }}
                >
                  <div className="font-condensed text-base font-bold uppercase text-[#141414] truncate">
                    {m.title}
                  </div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase">
                    {m.releaseYear} · {m.type.toUpperCase()} · IMDb {m.imdbRating}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPlay(m);
                  }}
                  className="p-2 bg-[#141414] text-[#FAF9F6] hover:bg-[#2B2A27] transition-colors cursor-pointer shrink-0"
                  title="Watch now"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

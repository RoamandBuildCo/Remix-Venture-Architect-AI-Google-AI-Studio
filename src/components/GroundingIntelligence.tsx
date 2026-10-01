import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Globe,
  Navigation,
  Compass,
  CheckCircle2,
  DollarSign,
  Layers,
  Building2
} from 'lucide-react';

export const GroundingIntelligence: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'search' | 'maps'>('maps');

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('Super73 RX 2024 sold price eBay OfferUp Los Angeles');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResultText, setSearchResultText] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<Array<{ title: string; uri: string }>>([]);

  // Maps State
  const [mapsQuery, setMapsQuery] = useState<string>('Police Safe Exchange Zones and LAPD Stations near Los Angeles CA');
  const [isMapping, setIsMapping] = useState<boolean>(false);
  const [mapsResultText, setMapsResultText] = useState<string | null>(null);
  const [mapsPlaces, setMapsPlaces] = useState<Array<{ title: string; uri: string }>>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation warning:', err);
        }
      );
    }
  };

  const executeSearchGrounding = async (queryToRun?: string) => {
    const q = (queryToRun || searchQuery).trim();
    if (!q) return;

    setErrorMessage(null);
    setIsSearching(true);
    setSearchResultText(null);
    setSearchSources([]);

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to retrieve search grounded results');
      }

      setSearchResultText(data.text);
      setSearchSources(data.sources || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error executing Google Search Grounding.');
    } finally {
      setIsSearching(false);
    }
  };

  const executeMapsGrounding = async (queryToRun?: string) => {
    const q = (queryToRun || mapsQuery).trim();
    if (!q) return;

    setErrorMessage(null);
    setIsMapping(true);
    setMapsResultText(null);
    setMapsPlaces([]);

    try {
      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          latitude: userCoords?.latitude,
          longitude: userCoords?.longitude,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to retrieve maps grounded locations');
      }

      setMapsResultText(data.text);
      setMapsPlaces(data.places || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error executing Google Maps Grounding.');
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Google Search & Maps Grounding Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>Real-Time Market & Location Grounding</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Grounded in live Google Search web intelligence and verified Google Maps locations using Gemini 3.5 Flash. Pinpoints police safe exchange zones for cash meetups and pulls 90-day sold pricing comps.
            </p>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveModule('maps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeModule === 'maps'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Maps Grounding</span>
            </button>

            <button
              onClick={() => setActiveModule('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeModule === 'search'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google Search Grounding</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* GOOGLE MAPS GROUNDING MODULE */}
      {/* ======================================================== */}
      {activeModule === 'maps' && (
        <div className="space-y-6">
          {/* Query Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Google Maps Query Engine (gemini-3.5-flash with googleMaps)</span>
              </span>
              <button
                onClick={handleDetectLocation}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                <span>{userCoords ? 'GPS Coords Locked' : 'Detect My Location'}</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeMapsGrounding();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={mapsQuery}
                onChange={(e) => setMapsQuery(e.target.value)}
                placeholder="e.g. Police Safe Exchange Zones in Los Angeles, CA or 24hr Chase Bank lobbies"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isMapping || !mapsQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/30 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>{isMapping ? 'Scanning Maps...' : 'Find Safe Locations'}</span>
              </button>
            </form>

            {/* Quick Location Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono text-slate-500">Fast Presets:</span>
              {[
                'LAPD Police Stations with Safe Exchange Zones in Los Angeles',
                '24-Hour Bank of America or Chase lobbies with ATM security in Downtown LA',
                'E-bike repair shops and battery rebuilders in Los Angeles',
              ].map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMapsQuery(preset);
                    executeMapsGrounding(preset);
                  }}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 px-3 py-1 rounded-full cursor-pointer transition-colors"
                >
                  {preset.split(' in ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Maps Results Display */}
          {mapsResultText && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detailed Location Recommendations */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Safe Location Intelligence</span>
                </div>
                <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {mapsResultText}
                </div>
              </div>

              {/* Clickable Google Maps Place Links (Strict Requirement) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>Google Maps Grounded Places</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {mapsPlaces.length} Verified
                  </span>
                </div>

                {mapsPlaces.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No individual place URI tags were returned. Review the safe locations described in the main report.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {mapsPlaces.map((place, idx) => (
                      <a
                        key={idx}
                        href={place.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 block group transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                            {place.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 truncate block mt-0.5">
                          Open in Google Maps Directions
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* GOOGLE SEARCH GROUNDING MODULE */}
      {/* ======================================================== */}
      {activeModule === 'search' && (
        <div className="space-y-6">
          {/* Query Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                <span>Live Web Grounding Engine (gemini-3.5-flash with googleSearch)</span>
              </span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                90-DAY REAL-TIME COMPS
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearchGrounding();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Segway Ninebot Max G30P historical sold price 2026 or Super73 battery recalls"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-950/30 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Grounding Web...' : 'Pull Live Comps'}</span>
              </button>
            </form>

            {/* Quick Search Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono text-slate-500">Live Comps:</span>
              {[
                'Super73 RX e-bike verified sold price completed listings',
                'Ninebot Max G30P used market price Los Angeles OfferUp',
                '1999 Pokemon Base Set Charizard raw LP sold price',
                'Arc\'teryx Beta LT jacket resale comps eBay Mercari',
              ].map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchQuery(preset);
                    executeSearchGrounding(preset);
                  }}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 px-3 py-1 rounded-full cursor-pointer transition-colors"
                >
                  {preset.split(' ')[0]} {preset.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Display */}
          {searchResultText && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detailed Market Intelligence */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 font-mono uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>Live Grounded Market Comps & Intel</span>
                </div>
                <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {searchResultText}
                </div>
              </div>

              {/* Clickable Grounded Web Sources */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400 font-mono uppercase tracking-wider">
                    <ExternalLink className="w-4 h-4" />
                    <span>Grounded Web Sources</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {searchSources.length} Citations
                  </span>
                </div>

                {searchSources.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No web source URLs returned directly in metadata.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {searchSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 block group transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-2">
                            {source.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 truncate block mt-1">
                          {source.uri}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

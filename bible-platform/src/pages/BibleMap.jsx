import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapPin, Compass, Search, Filter, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import locationsData from '../data/locations.json';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle auto-zoom when a specific location is selected
function MapController({ selectedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 12, {
        duration: 1.5
      });
    } else {
      // Default view to Israel/Palestine region
      map.flyTo([31.7683, 35.2137], 7, { duration: 1.5 });
    }
  }, [selectedLocation, map]);
  return null;
}

export default function BibleMap() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract unique types for the filter
  const allTypes = ["전체", ...new Set(locationsData.map(loc => loc.type))].filter(Boolean);

  // Check if we came from Read.jsx with a requested location
  useEffect(() => {
    if (location.state && location.state.searchLoc) {
      const searchTarget = location.state.searchLoc;
      setSearchQuery(searchTarget);
      
      const found = locationsData.find(l => 
        l.name.includes(searchTarget) || 
        (l.name_en && l.name_en.toLowerCase().includes(searchTarget.toLowerCase())) ||
        (l.name_ko_alt && l.name_ko_alt.some(alt => alt.includes(searchTarget)))
      );
      if (found) {
        setSelectedLoc(found);
        setDrawerOpen(true);
      }
    }
  }, [location]);

  // Filter locations
  const filteredLocations = locationsData.filter(loc => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = loc.name.includes(searchQuery) || 
      (loc.name_en && loc.name_en.toLowerCase().includes(searchLower)) ||
      (loc.name_ko_alt && loc.name_ko_alt.some(alt => alt.includes(searchQuery)));
    const matchFilter = activeFilter === "전체" || loc.type === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleSelectLocation = (loc) => {
    setSelectedLoc(loc);
    setDrawerOpen(true);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 60px)', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* Search and Filter UI overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 1000, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="성경 지명 검색 (예: 예루살렘, 갈릴리)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '30px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', pointerEvents: 'auto', scrollbarWidth: 'none' }}>
          {allTypes.slice(0, 8).map(type => (
            <button 
              key={type}
              onClick={() => setActiveFilter(type)}
              style={{
                padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap', cursor: 'pointer',
                backgroundColor: activeFilter === type ? 'var(--accent-gold)' : 'var(--glass-bg)',
                color: activeFilter === type ? '#000' : 'var(--text-primary)',
                border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)',
                fontWeight: activeFilter === type ? 'bold' : 'normal', transition: 'all 0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div style={{ width: '100%', height: '100%', zIndex: 0 }}>
        <MapContainer center={[31.7683, 35.2137]} zoom={7} style={{ width: '100%', height: '100%' }} zoomControl={false}>
          {/* Using a sleek dark mode map tile from CartoDB */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a> | Data by <a href="https://openbible.info">OpenBible.info</a>'
          />
          <MapController selectedLocation={selectedLoc} />
          
          {/* Only render first 300 to avoid freezing the browser if no filter applied */}
          {filteredLocations.slice(0, 300).map((loc) => (
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lng]}
              eventHandlers={{
                click: () => handleSelectLocation(loc)
              }}
            >
              <Popup>
                <div style={{ color: '#333' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{loc.name}</h3>
                    {loc.status === '확인 필요' && (
                      <span style={{ fontSize: '10px', background: '#ffebee', color: '#c62828', padding: '2px 4px', borderRadius: '4px' }}>검수요망</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    {loc.name_en} • {loc.type}
                  </div>
                  {loc.name_ko_alt && loc.name_ko_alt.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                      다른 이름: {loc.name_ko_alt.join(', ')}
                    </div>
                  )}
                  {loc.verses && loc.verses.length > 0 && (
                    <div style={{ fontSize: '12px' }}>
                      <strong>관련 구절:</strong> {loc.verses.slice(0, 3).join(', ')}
                      {loc.verses.length > 3 && ' ...'}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom Information Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedLoc && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: 'var(--bg-secondary)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <MapPin color="var(--accent-gold)" size={24} />
                  <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--accent-gold)' }}>{selectedLoc.name}</h2>
                  {selectedLoc.status === '확인 필요' && (
                    <span style={{ fontSize: '12px', background: 'rgba(244, 67, 54, 0.1)', color: '#f44336', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(244, 67, 54, 0.3)' }}>음역 검수요망</span>
                  )}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{selectedLoc.name_en}</span> | {selectedLoc.type}
                </div>
                {selectedLoc.name_ko_alt && selectedLoc.name_ko_alt.length > 0 && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <span style={{ opacity: 0.7 }}>대체어/다른표기: </span> {selectedLoc.name_ko_alt.join(', ')}
                  </div>
                )}
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', padding: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            {selectedLoc.verses && selectedLoc.verses.length > 0 ? (
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>주요 관련 구절 (터치시 이동)</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {selectedLoc.verses.map((v, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>
                      <button 
                        onClick={() => navigate('/read', { state: { verseRef: v } })}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', textDecoration: 'underline', cursor: 'pointer', fontSize: '15px', padding: 0, textAlign: 'left' }}
                      >
                        {v}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>관련 성경 구절 정보가 부족합니다.</div>
            )}
            
            <button 
              onClick={() => {
                const mapLink = `https://www.google.com/maps/search/?api=1&query=${selectedLoc.lat},${selectedLoc.lng}`;
                window.open(mapLink, '_blank');
              }}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--accent-gold)', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Compass size={20} /> 구글 지도로 열기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 900, backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#ccc' }}>
        {filteredLocations.length}개의 지명 표시중
      </div>
    </div>
  );
}

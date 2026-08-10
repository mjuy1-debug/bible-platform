import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapPin, Compass, X } from 'lucide-react';

const LOCATIONS = [
  {
    id: 1,
    name: "예루살렘",
    description: "다윗이 도읍으로 정한 곳이자 예수님이 십자가에 못 박히신 성전의 도시. 이스라엘의 정치적, 종교적 중심지입니다.",
    verse: "마태복음 21:10 - 예수께서 예루살렘에 들어가시니 온 성이 소동하여 이르되 이는 누구냐 하거늘",
    image: "https://images.unsplash.com/photo-1549479326-0e10cc0eb85a?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 2,
    name: "갈릴리",
    description: "예수님이 대부분의 사역을 하신 지역. 갈릴리 호수를 중심으로 많은 기적이 일어났습니다.",
    verse: "마태복음 4:23 - 예수께서 온 갈릴리에 두루 다니사 그들의 회당에서 가르치시며 천국 복음을 전파하시며",
    image: "https://images.unsplash.com/photo-1476900543704-4312b78632f8?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    name: "베들레헴",
    description: "다윗의 고향이자 예수님이 탄생하신 곳. '떡집'이라는 뜻을 가지고 있습니다.",
    verse: "마태복음 2:1 - 헤롯 왕 때에 예수께서 유대 베들레헴에서 나시매 동방으로부터 박사들이 예루살렘에 이르러 말하되",
    image: "https://images.unsplash.com/photo-1518709779341-56cf4535e94b?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 4,
    name: "나사렛",
    description: "예수님이 어린 시절을 보내며 자라나신 동네. 갈릴리 남부에 위치한 작은 마을이었습니다.",
    verse: "누가복음 2:51 - 예수께서 함께 내려가사 나사렛에 이르러 순종하여 받드시더라",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 5,
    name: "사마리아",
    description: "유대인들이 기피했던 지역이나, 예수님은 이곳을 지나며 사마리아 여인에게 복음을 전하셨습니다.",
    verse: "요한복음 4:4 - 사마리아를 통과하여야 하겠는지라",
    image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=600"
  }
];

export default function BibleMap() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)', 
      fontFamily: 'sans-serif' 
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Map size={32} color="var(--accent-gold)" />
          <h1 style={{ margin: 0, color: 'var(--accent-gold)' }}>성경 주요 지명</h1>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {LOCATIONS.map((loc) => (
            <motion.div
              key={loc.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedLocation(loc)}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ 
                height: '200px', 
                backgroundImage: `url(${loc.image})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: '1rem',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} color="var(--accent-gold)" />
                    {loc.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedLocation && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }} onClick={() => setSelectedLocation(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '24px',
                  maxWidth: '600px',
                  width: '100%',
                  overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ 
                  height: '300px', 
                  backgroundImage: `url(${selectedLocation.image})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    style={{
                      position: 'absolute',
                      top: '1rem', right: '1rem',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px', height: '40px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ 
                    margin: '0 0 1rem 0', 
                    color: 'var(--accent-gold)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <Compass size={24} />
                    {selectedLocation.name}
                  </h2>
                  
                  <p style={{ 
                    lineHeight: '1.6', 
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    marginBottom: '1.5rem'
                  }}>
                    {selectedLocation.description}
                  </p>
                  
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    borderLeft: '4px solid var(--accent-gold)'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>관련 말씀</h4>
                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-primary)' }}>
                      "{selectedLocation.verse}"
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

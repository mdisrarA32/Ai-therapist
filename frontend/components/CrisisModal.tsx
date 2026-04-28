import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertTriangle, X, Heart } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedLanguage: string;
  onAlertSent?: () => void;
}

const HELPLINES = [
  {
    name: 'ASHA Helpline (Punjab)',
    number: '0172-2660078',
    number2: '0172-2660178',
    available: '24/7',
    icon: '🏥'
  },
  {
    name: 'iCall',
    number: '9152987821',
    available: 'Mon-Sat 8AM-10PM',
    icon: '📞'
  },
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    available: '24/7',
    icon: '💚'
  },
  {
    name: 'NIMHANS',
    number: '080-46110007',
    available: '24/7',
    icon: '🏨'
  }
];

export default function CrisisModal({ isOpen, onClose, detectedLanguage, onAlertSent }: CrisisModalProps) {
  const [alertSent, setAlertSent] = useState(false);
  const [sending, setSending] = useState(false);
  const isHindi = detectedLanguage === 'hi';

  // Auto-send emergency alert when modal opens
  useEffect(() => {
    if (isOpen && !alertSent) {
      handleSendAlert();
    }
  }, [isOpen]);

  const handleSendAlert = async () => {
    setSending(true);
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');

      await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, detectedLanguage })
      });

      setAlertSent(true);
      onAlertSent?.();
    } catch (err) {
      console.error('Alert send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFindNearby = () => {
    // Open Google Maps searching for psychiatrists near user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          window.open(
            `https://www.google.com/maps/search/psychiatrist+near+me/@${latitude},${longitude},14z`,
            '_blank'
          );
        },
        () => {
          // Fallback if geolocation denied
          window.open(
            'https://www.google.com/maps/search/psychiatrist+near+me',
            '_blank'
          );
        }
      );
    } else {
      window.open(
        'https://www.google.com/maps/search/psychiatrist+near+me',
        '_blank'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="crisis-overlay z-50">
      <div className="crisis-modal" style={{ zIndex: 51 }}>

        {/* Header */}
        <div className="crisis-header hidden-until-fadein">
          <AlertTriangle size={32} color="#ef4444" />
          <h2>
            {isHindi ? '⚠️ आप अकेले नहीं हैं — मदद उपलब्ध है' : '⚠️ You Are Not Alone — Help Is Available'}
          </h2>
        </div>

        {/* Alert Sent Badge */}
        {alertSent && (
          <div className="alert-sent-badge">
            <Heart size={16} />
            {isHindi
              ? '✅ आपके आपातकालीन संपर्क को सूचित कर दिया गया है'
              : '✅ Your emergency contact has been notified'}
          </div>
        )}
        {sending && (
          <div className="alert-sending-badge">
            {isHindi ? '📤 आपातकालीन संपर्क को सूचित किया जा रहा है...' : '📤 Notifying your emergency contact...'}
          </div>
        )}

        {/* Crisis Message */}
        <p className="crisis-message">
          {isHindi
            ? 'आपकी भावनाएं वैध हैं। कृपया अभी किसी से बात करें। नीचे दिए गए नंबरों पर कॉल करें:'
            : 'Your feelings are valid. Please talk to someone right now. Call one of these numbers:'}
        </p>

        {/* Helpline Numbers */}
        <div className="helpline-grid">
          {HELPLINES.map((h, i) => (
            <div key={i} className="helpline-card">
              <span className="helpline-icon">{h.icon}</span>
              <div className="helpline-info">
                <strong>{h.name}</strong>
                <a href={`tel:${h.number}`} className="helpline-number">
                  <Phone size={14} /> {h.number}
                </a>
                {h.number2 && (
                  <a href={`tel:${h.number2}`} className="helpline-number">
                    <Phone size={14} /> {h.number2}
                  </a>
                )}
                <span className="helpline-hours">{h.available}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Find Nearby Psychiatrist */}
        <button className="find-nearby-btn" onClick={handleFindNearby}>
          <MapPin size={18} />
          {isHindi ? '🗺️ नजदीकी मनोचिकित्सक खोजें' : '🗺️ Find Nearest Psychiatrist'}
        </button>

        {/* Close Button */}
        <button className="crisis-close-btn" onClick={onClose}>
          <X size={16} />
          {isHindi ? 'मैं ठीक हूं, बंद करें' : "I'm safe, close this"}
        </button>

      </div>
    </div>
  );
}

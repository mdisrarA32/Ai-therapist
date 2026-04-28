'use client'

import { useState } from 'react'

interface EmergencyContact {
  name?: string
  phone?: string
  relationship?: string
  email?: string
}

interface CrisisSupportModalProps {
  isOpen: boolean
  onClose: () => void
  emergencyContact?: EmergencyContact
  userName?: string
  onStartTherapy?: () => void
}

export default function CrisisSupportModal({
  isOpen,
  onClose,
  emergencyContact,
  userName = 'there',
  onStartTherapy
}: CrisisSupportModalProps) {
  if (!isOpen) return null

  const firstName = userName.split(' ')[0]

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: '#f1f5f9', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#64748b'
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ padding: '32px 24px 24px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            🤝
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
            You are not alone, {firstName}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            It takes courage to reach out. Here are people who care and want to help you right now.
          </p>
        </div>

        {/* Emergency Contact Section */}
        {emergencyContact?.name || emergencyContact?.phone ? (
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Your Emergency Contact
            </h3>
            {emergencyContact.name && (
              <div style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', marginBottom: '4px' }}>
                {emergencyContact.name}
                {emergencyContact.relationship && (
                  <span style={{ color: '#64748b', fontWeight: 400 }}>
                    {' '}· {emergencyContact.relationship}
                  </span>
                )}
              </div>
            )}
            {emergencyContact.phone && (
              <a 
                href={`tel:${emergencyContact.phone}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  color: '#2563a8', fontWeight: 500, textDecoration: 'none',
                  fontSize: '15px', marginTop: '4px'
                }}
              >
                📞 Call {emergencyContact.name || 'Emergency Contact'}
              </a>
            )}
          </div>
        ) : (
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              No emergency contact saved.{' '}
              <a href="/profile" style={{ color: '#2563a8', fontWeight: 500, textDecoration: 'underline' }}>
                Add one in your profile
              </a>
              {' '}so someone you trust is always one tap away.
            </p>
          </div>
        )}

        {/* Professional Helplines */}
        <div style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🆘 Professional Crisis Helplines
          </h3>

          {[
            { name: 'iCall', number: '9152987821', desc: 'Mon–Sat, 8am–10pm' },
            { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 Mental health support' },
            { name: 'AASRA', number: '9820466627', desc: '24/7 Suicide prevention' },
            { name: 'Snehi', number: '044-24640050', desc: 'Emotional support helpline' },
          ].map((helpline) => (
            <div key={helpline.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a' }}>
                  {helpline.name}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  {helpline.desc}
                </div>
              </div>
              <a 
                href={`tel:${helpline.number}`}
                style={{
                  background: '#e0f2fe', color: '#0369a1', padding: '8px 12px',
                  borderRadius: '6px', fontSize: '14px', fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                {helpline.number}
              </a>
            </div>
          ))}
        </div>

        {/* Start Therapy Button */}
        <div style={{ padding: '0 24px 24px' }}>
          <button
            onClick={() => {
              onClose()
              if (onStartTherapy) onStartTherapy()
            }}
            style={{
              width: '100%', background: '#2563a8', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '13px',
              fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            💬 Talk to AI Therapist right now
          </button>
          
          <button
            onClick={onClose}
            style={{
              width: '100%', background: 'transparent', color: '#64748b',
              border: 'none', padding: '12px', fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            I am okay, close this
          </button>
        </div>
      </div>
    </div>
  )
}

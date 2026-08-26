import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Hoberg Jobs — Verified Remote Opportunities Worldwide'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #111113 0%, #1a1a1d 50%, #111113 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.45) 0%, rgba(220, 38, 38, 0) 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Brand Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            padding: '8px 20px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '9999px',
              backgroundColor: '#dc2626',
            }}
          />
          <span
            style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            BUILT BY HOBERG DIGITAL AGENCY
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
          }}
        >
          Hoberg Jobs
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '32px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            marginBottom: '40px',
          }}
        >
          Verified Remote Careers in Nigeria, Africa & Worldwide
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Customer Support', 'Virtual Assistant', 'Writing & SEO', 'Finance', 'Tech & Dev', 'Marketing'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  backgroundColor: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid rgba(220, 38, 38, 0.4)',
                  color: '#fca5a5',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  padding: '8px 18px',
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          <span>jobs.hoberg.com.ng</span>
          <span>•</span>
          <span style={{ color: '#ef4444' }}>hoberg.com.ng</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}


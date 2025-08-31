import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#86288F' }}>
        Page Not Found
      </h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Could not find the requested page.
      </p>
      <Link 
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '500'
        }}
      >
        Return Home
      </Link>
    </div>
  );
}

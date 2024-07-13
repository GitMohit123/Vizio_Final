import React from 'react'

const LandingPage = () => {
  return (
    <div className='landing-page' style={{ height: '100vh', width: '100%' }}>
      <iframe 
        src="https://vizio.framer.website/" 
        style={{ border: 'none', width: '100%', height: '100%' }} 
        title="Framer Website"
      />
    </div>
  )
}

export default LandingPage
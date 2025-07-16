import React, { useState } from 'react';
import { Organization } from '../types';
import { authApi } from '../services/api';

interface SignupFlowProps {
  onLogin: (user: Organization, userType: 'nonprofit' | 'forprofit') => void;
}

const SignupFlow: React.FC<SignupFlowProps> = ({ onLogin }) => {
  const [currentStep, setCurrentStep] = useState<'type-selection' | 'name-input' | 'registration-form' | 'success'>('type-selection');
  const [orgType, setOrgType] = useState<'nonprofit' | 'forprofit' | null>(null);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundOrg, setFoundOrg] = useState<Organization | null>(null);
  
  // Registration form state for new organizations
  const [formData, setFormData] = useState({
    location: '',
    industry: '',
    values: '',
    workLocations: ['']
  });

  const handleTypeSelection = (type: 'nonprofit' | 'forprofit') => {
    setOrgType(type);
    setCurrentStep('name-input');
  };

  const handleBack = () => {
    if (currentStep === 'name-input') {
      setCurrentStep('type-selection');
    } else if (currentStep === 'registration-form') {
      setCurrentStep('name-input');
    }
  };

  const handleOrgNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !orgType) return;

    setLoading(true);
    setError('');

    try {
      const response = await authApi.signup(orgType, orgName.trim());
      
      if (response.orgFound && response.organization) {
        // Organization found - proceed to main app
        onLogin(response.organization, orgType);
      } else {
        // Organization not found
        if (orgType === 'nonprofit') {
          setError('Nonprofit not found in our database. Please contact support.');
        } else {
          // For-profit not found - show registration form
          setCurrentStep('registration-form');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !formData.location || !formData.industry || 
        !formData.values) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
              const response = await authApi.registerNewOrg({
          orgName: orgName.trim(),
          issueArea: formData.industry,
          region: formData.location,
          mission: `We are committed to delivering innovative solutions that create positive impact for customers, communities, and society while building a sustainable and responsible business.`,
          values: formData.values,
          workLocations: formData.workLocations.filter(loc => loc.trim())
        });
      
      if (response.organization) {
        onLogin(response.organization, 'forprofit');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '"Inter", sans-serif',
      color: '#1e293b'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '32px', fontWeight: '800' }}>NGO Marketplace</h1>
          <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '400' }}>Connecting nonprofits and for-profits for collaborative impact</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '30px',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '400'
          }}>
            {error}
          </div>
        )}

        {currentStep === 'type-selection' && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>
              Welcome! What type of organization are you?
            </h2>
            <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
              <button
                onClick={() => handleTypeSelection('nonprofit')}
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                🏛️ Nonprofit Organization
                <div style={{ fontSize: '14px', fontWeight: '400', color: '#64748b', marginTop: '8px' }}>
                  Looking for funding, partnerships, and collaborations
                </div>
              </button>
              <button
                onClick={() => handleTypeSelection('forprofit')}
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                🏢 For-Profit Company
                <div style={{ fontSize: '14px', fontWeight: '400', color: '#64748b', marginTop: '8px' }}>
                  Looking to create social impact and partnerships
                </div>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'name-input' && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>
              What's your organization's name?
            </h2>
            <div style={{ marginBottom: '25px' }}>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Enter your organization name"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '400',
                  background: 'white',
                  color: '#1e293b',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Back
              </button>
              <button
                onClick={handleOrgNameSubmit}
                disabled={loading || !orgName.trim()}
                style={{
                  flex: 2,
                  padding: '16px',
                  background: orgName.trim() ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: orgName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'registration-form' && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>
              Register Your Organization
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '40px', color: '#64748b', fontSize: '16px', fontWeight: '400' }}>
              We need some additional information to create your profile.
            </p>
            <form onSubmit={handleRegistration}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '400',
                    background: '#f8fafc',
                    color: '#64748b'
                  }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Headquarters Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State/Country"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '400',
                    background: 'white',
                    color: '#1e293b',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '400',
                    background: 'white',
                    color: '#1e293b',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Core Values</label>
                <textarea
                  value={formData.values}
                  onChange={(e) => setFormData({...formData, values: e.target.value})}
                  placeholder="List your organization's core values and principles"
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '400',
                    background: 'white',
                    color: '#1e293b',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: '"Inter", sans-serif'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 'success' && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '24px', fontWeight: '800' }}>
              Welcome to NGO Marketplace!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '16px', fontWeight: '400' }}>
              Your account has been created successfully. You can now start exploring potential partnerships and collaborations.
            </p>
                         <button
               onClick={() => foundOrg && onLogin(foundOrg, orgType!)}
               style={{
                 padding: '16px 32px',
                 background: '#3b82f6',
                 color: 'white',
                 border: 'none',
                 borderRadius: '12px',
                 cursor: 'pointer',
                 fontSize: '16px',
                 fontWeight: '600'
               }}
             >
               Get Started
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupFlow; 
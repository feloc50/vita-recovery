import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Lock, Mail, Phone, User, Pencil, Bell, ArrowLeft } from 'lucide-react';
import { Toast } from '../components/Toast';
import { format, isValid, parse } from 'date-fns';
import { getUserProfile, saveUserProfile, UserProfile } from '../services/profile';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export function Settings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<Omit<UserProfile, 'updatedAt'>>({
    firstName: '',
    lastName: '',
    gender: 'male',
    birthdate: '',
    phone: '',
    emailNotifications: true,
    smsNotifications: false,
    types: ['client']
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});

  useEffect(() => {
    async function loadUserProfile() {
      if (!currentUser) {
        navigate('/signin');
        return;
      }

      try {
        setLoading(true);
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          const { updatedAt, ...profileData } = profile;
          setFormData(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setToast({
          message: 'Failed to load profile data. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [currentUser, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.birthdate) {
      newErrors.birthdate = 'Birthdate is required';
    } else {
      const date = parse(formData.birthdate, 'yyyy-MM-dd', new Date());
      if (!isValid(date) || date > new Date()) {
        newErrors.birthdate = 'Please enter a valid birthdate';
      }
    }

    const phoneRegex = /^09\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must start with 09 followed by 7 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    handleInputChange('phone', value);
  };

  const handlePasswordChangeSuccess = () => {
    setToast({
      message: 'Password updated successfully',
      type: 'success'
    });
  };

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    if (!validateForm()) {
      setToast({
        message: 'Please correct the errors before saving',
        type: 'error'
      });
      return;
    }

    setSaving(true);
    
    try {
      await saveUserProfile(currentUser.uid, formData);
      
      setToast({
        message: 'Settings saved successfully',
        type: 'success'
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setToast({
        message: 'Failed to save settings. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Profile Information
                </h3>
              </div>

              <form className="mt-4 space-y-6" onSubmit={handleSaveSettings}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      disabled={!isEditing}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`mt-1 block w-full rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      } border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      disabled={!isEditing}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`mt-1 block w-full rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      } border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      disabled={!isEditing}
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value as UserProfile['gender'])}
                      className={`mt-1 block w-full rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      } border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                      Birthdate
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      disabled={!isEditing}
                      value={formData.birthdate}
                      onChange={(e) => handleInputChange('birthdate', e.target.value)}
                      className={`mt-1 block w-full rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      } border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                    {errors.birthdate && (
                      <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="09XXXXXXX"
                      className={`mt-1 block w-full rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      } border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-900">{currentUser?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary-500" />
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Notification Settings
                    </h3>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-sm text-gray-500">Receive appointment reminders via email</p>
                      </div>
                      <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() => handleInputChange('emailNotifications', !formData.emailNotifications)}
                        className={`${
                          formData.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`${
                            formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                        <p className="text-sm text-gray-500">Receive appointment reminders via SMS</p>
                      </div>
                      <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() => handleInputChange('smsNotifications', !formData.smsNotifications)}
                        className={`${
                          formData.smsNotifications ? 'bg-primary-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`${
                            formData.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-primary-500" />
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Security
                    </h3>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !isEditing}
                onClick={handleSaveSettings}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  );
}
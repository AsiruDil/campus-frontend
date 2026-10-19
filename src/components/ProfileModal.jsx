import { profileImageUrl, useDefaultProfileImage } from '../util/profileImage';
import { useState } from 'react';
import Modal from 'react-modal';
import { FiCamera, FiCheckCircle, FiLogOut, FiSave, FiX } from 'react-icons/fi';

export default function ProfileModal({ isOpen, onClose, userData, setUserData, image, onImageChange, fileInputRef, onIdChange, onSave, onLogout, role }) {
  const [saving, setSaving] = useState(false);
  const complete = Boolean(userData.idNumber && userData.birthday && userData.sex && userData.sex !== '-' && userData.age !== '' && userData.age !== '-');
  return <Modal isOpen={isOpen} onRequestClose={() => !saving && onClose()} contentLabel="Your profile" className="profile-dialog" overlayClassName="profile-overlay">
    <header className="profile-heading"><div><span>ACCOUNT SETTINGS</span><h2>Your profile</h2><p>Keep your personal information up to date.</p></div><button aria-label="Close profile" disabled={saving} onClick={onClose}><FiX size={22}/></button></header>
    <form onSubmit={async event => { event.preventDefault(); setSaving(true); try { await onSave(); } finally { setSaving(false); } }}>
      <fieldset disabled={saving}>
        <div className="profile-identity"><div className="profile-photo"><img src={profileImageUrl(image)} onError={useDefaultProfileImage} alt="Profile"/><button type="button" aria-label="Change profile photo" onClick={() => fileInputRef.current.click()}><FiCamera/></button></div><div><span className="profile-role">{role}</span><h3>{userData.name || 'Your account'}</h3><p>{userData.email}</p><small>Optional PNG or JPEG, up to 2 MB.</small></div><input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onImageChange}/></div>
        <div className={`profile-completion ${complete ? 'complete' : ''}`}><FiCheckCircle/><div><strong>{complete ? 'Profile details completed' : 'Complete your personal details'}</strong><p>{complete ? 'Your personal details are saved when you select Save profile.' : role === 'User' ? 'Complete your NIC, birthday, age and gender before applying for a job.' : 'Your NIC fills in birthday, age and gender automatically.'}</p></div></div>
        <section className="profile-fields"><h3>Personal information</h3><label>NIC / ID number<input value={userData.idNumber} onChange={onIdChange} placeholder="Enter your NIC number" maxLength={12} pattern="([0-9]{9}[VvXx]|[0-9]{12})" required/><small>Use 9 digits followed by V/X, or 12 digits. Birthday, age and gender are filled from your NIC.</small></label><label>Date of birth<input type="date" value={userData.birthday || ''} required onChange={event => setUserData(current => ({ ...current, birthday: event.target.value }))}/></label><div className="profile-derived"><div><span>Age</span><strong>{userData.age || '-'}</strong></div><div><span>Gender</span><strong>{userData.sex || '-'}</strong></div></div></section>
      </fieldset>
      <footer className="profile-actions"><button type="button" className="profile-signout" disabled={saving} onClick={onLogout}><FiLogOut/> Sign out</button><button type="button" disabled={saving} onClick={onClose}>Cancel</button><button className="profile-save" disabled={saving}><FiSave/> {saving ? 'Saving...' : 'Save profile'}</button></footer>
    </form>
  </Modal>;
}

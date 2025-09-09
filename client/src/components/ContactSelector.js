import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  PhoneIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ContactSelector = ({ onSelectContact, selectedContact, onClear }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  // const [loading, setLoading] = useState(false); // For future use

  useEffect(() => {
    // All 10 demo users available for lending/borrowing
    const demoContacts = [
      { id: 'user_001', name: 'Priya Rajesh', phone: '+919000000001', avatar: null, isRegistered: true },
      { id: 'user_002', name: 'Arjun Kumar', phone: '+919000000002', avatar: null, isRegistered: true },
      { id: 'user_003', name: 'Suresh Venkatesh', phone: '+919000000003', avatar: null, isRegistered: true },
      { id: 'user_004', name: 'Meera Patel', phone: '+919000000004', avatar: null, isRegistered: true },
      { id: 'user_005', name: 'Rajesh Gupta', phone: '+919000000005', avatar: null, isRegistered: true },
      { id: 'user_006', name: 'Anita Sharma', phone: '+919000000006', avatar: null, isRegistered: true },
      { id: 'user_007', name: 'Vikram Singh', phone: '+919000000007', avatar: null, isRegistered: true },
      { id: 'user_008', name: 'Deepika Reddy', phone: '+919000000008', avatar: null, isRegistered: true },
      { id: 'user_009', name: 'Rohit Agarwal', phone: '+919000000009', avatar: null, isRegistered: true },
      { id: 'user_010', name: 'Kavya Nair', phone: '+919000000010', avatar: null, isRegistered: true },
    ];
    
    setContacts(demoContacts);
    setFilteredContacts(demoContacts);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

  const handleContactSelect = (contact) => {
    if (contact.isRegistered) {
      onSelectContact(contact);
      setShowContacts(false);
      setSearchTerm('');
    }
  };

  const handleInputFocus = () => {
    setShowContacts(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowContacts(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowContacts(false);
    onClear();
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={selectedContact ? selectedContact.name : searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search contacts or enter phone number"
          className="form-input pr-10"
        />
        {selectedContact && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Contact Dropdown */}
      {showContacts && !selectedContact && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            <div className="py-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 ${
                    !contact.isRegistered ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      {contact.isRegistered && (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <PhoneIcon className="w-3 h-3 text-gray-400" />
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                  </div>

                  {!contact.isRegistered && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not on PaySafe
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contacts found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try searching with a different name or phone number
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Contact Display */}
      {selectedContact && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {selectedContact.avatar ? (
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedContact.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {selectedContact.name}
                </p>
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center space-x-1">
                <PhoneIcon className="w-3 h-3 text-gray-400" />
                <p className="text-sm text-gray-500">{selectedContact.phone}</p>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showContacts && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContacts(false)}
        />
      )}
    </div>
  );
};

export default ContactSelector;

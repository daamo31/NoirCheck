/**
 * XION Abstraxion Modal Component for React Native
 * DEPRECATED - Not needed with @burnt-labs/abstraxion-react-native
 * The modal is handled automatically by AbstraxionProvider
 */

import React from 'react';

interface XionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// This component is no longer needed as Abstraxion React Native handles modals automatically
export function XionModal({ isOpen, onClose }: XionModalProps) {
  // React Native version uses WebBrowser for authentication flow
  // No need for custom modal component
  return null;
}

export default XionModal;

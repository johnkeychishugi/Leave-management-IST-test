import React, { createContext, useContext } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import useConfirm from '@/lib/hooks/useConfirm';

type ConfirmContextType = {
  confirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirmDialog = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isOpen, confirm, handleClose, handleConfirm, options } = useConfirm();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider; 
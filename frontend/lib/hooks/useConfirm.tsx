import { useState, useCallback } from 'react';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
};

type ConfirmReturn = {
  isOpen: boolean;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleClose: () => void;
  handleConfirm: () => void;
  options: ConfirmOptions;
};

export const useConfirm = (): ConfirmReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => () => {});

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resolver(false);
  }, [resolver]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolver(true);
  }, [resolver]);

  return {
    isOpen,
    confirm,
    handleClose,
    handleConfirm,
    options,
  };
};

export default useConfirm; 
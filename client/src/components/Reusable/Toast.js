import {useContext, useCallback, useEffect} from 'react';

import {useToast} from '@chakra-ui/react';
import utilGeneral from 'util992/functions/general';

import {GlobalContext} from '../../context/GlobalState';

const Toast = () => {
  const toastObj = useToast();

  const {toast} = useContext(GlobalContext);

  const showToast = useCallback(() => {
    const {
      title = '',
      message = '',
      status = 'info',
      duration = '2000',
    } = toast;

    toastObj({
      title: title,
      description: message,
      status: status,
      duration: duration,
      isClosable: true,
    });
  }, [toastObj, toast]);

  useEffect(() => {
    if (!utilGeneral.isEmptyObject(toast)) {
      showToast();
    }
  }, [toast, showToast]);

  return <></>;
};

export default Toast;

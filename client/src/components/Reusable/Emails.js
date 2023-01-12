import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';

import Loading from './Loading';

axios.timeout = 10000;

const Emails = () => {
  const {type, recordId} = useParams();

  const [isSuccess, setIsSuccess] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sendEmail = async () => {
      setIsLoading(true);

      try {
        let sendEmailRes;
        if (type === 'entry')
          sendEmailRes = await axios.post(`/api/emails/entry/${recordId}`, {
            isResending: true,
          });
        else if (type === 'leaser')
          sendEmailRes = await axios.post(`/api/emails/leaser/${recordId}`, {
            isResending: true,
          });

        if (sendEmailRes.data.code === 200) return setIsSuccess(true);

        throw new Error('');
      } catch (err) {
        setIsSuccess(false);
        setIsLoading(false);
      }
    };

    swal({
      title: 'Er du sikker?',
      text: 'Vil du sende e-mailen igen?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willResend) => {
      if (willResend) {
        setIsLoading(true);
        sendEmail();
      } else {
        swal('Denne side lukker nu!').then(() => {
          window.opener = null;
          window.open('', '_self');
          window.close();
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSuccess)
      swal('E-mail er afsendt med succes! Siden lukkes nu.', {
        icon: 'success',
      }).then(() => {
        window.opener = null;
        window.open('', '_self');
        window.close();
      });
    else if (isSuccess === false)
      swal(
        'Afsendelse af e-mail mislykkedes! Prøv venligst igen. Siden lukkes nu.',
        {
          icon: 'error',
        }
      );
  }, [isSuccess]);

  return (
    <>
      {isLoading ? (
        <Loading message="Vi sender emailen igen, det kan tage noget tid at færdiggøre den" />
      ) : isSuccess === undefined ? (
        <></>
      ) : isSuccess ? (
        <></>
      ) : (
        <></>
      )}
    </>
  );
};

export default Emails;

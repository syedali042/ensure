import {useContext, useCallback, useState} from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Link,
  Spacer,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

import {GlobalContext} from '../../context/GlobalState';
import Toast from '../Reusable/Toast';

const Login = () => {
  const navigate = useNavigate();

  const {values, toast, updateTokenAndAgentId, setToast} =
    useContext(GlobalContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  function isValidEmailAddress(address) {
    return !!address.match(
      // eslint-disable-next-line
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    );
  }

  const handleSubmit = useCallback(
    async (e) => {
      try {
        if (isValidEmailAddress(email)) {
          if (email === '' || password === '') {
            return setToast({
              title: 'Fejl',
              message: 'Indtast venligst dit brugernavn og din adgangskode',
              status: 'error',
            });
          }
        } else
          return setToast({
            title: 'Fejl',
            message: 'Dette er ikke en gyldig e-mail-adresse',
            status: 'error',
          });

        setButtonDisabled(true);

        const authF = values.fields.auth.fields;

        const loginRes = await axios.post('/api/login', {
          [authF.email.api]: email,
          [authF.password.api]: password,
          [authF.type.api]: authF.agentType.value,
        });
        const data = loginRes.data;

        updateTokenAndAgentId(data[authF.accessToken.api]);

        navigate('/', {replace: true});
      } catch (err) {
        setButtonDisabled(false);
        if (err.response) {
          const data = err.response.data;

          if (data.code === 404)
            return setToast({
              title: 'Fejl',
              message: `Denne konto fremgår ikke af vores database, bekræft venligst oplysningerne eller tjek med administratoren.`,
              status: 'error',
            });
          else if (data.code === 409)
            return setToast({
              title: 'Fejl',
              message: `Beklager, men det ser ud til, at der er flere konti med dette brugernavn, kontakt venligst administratoren for at løse problemet.`,
              status: 'error',
            });
          return setToast({
            title: 'Fejl',
            message: data.message,
            status: 'error',
          });
        } else {
          return setToast({
            title: 'Fejl',
            message: 'Intern serverfejl',
            status: 'error',
          });
        }
      }
    },
    [email, password, values, navigate, setToast, updateTokenAndAgentId]
  );

  const handleKeypress = useCallback(
    (e) => {
      //it triggers by pressing the enter key
      if (e.charCode === 13) {
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <Flex direction="column" w="100vw" h="100vh" alignSelf="center">
      <VStack my="10%" w={['30%', '30%', '30%']} alignSelf="center">
        <Spacer></Spacer>
        <Image
          src="/img/logo.png"
          alt="Ensure International Insurance Broker Logo"
        />

        <FormControl color="black" pt="10" px="2">
          <FormLabel>E-mail:</FormLabel>
          <Input
            id="email"
            color="black"
            type="email"
            autoFocus={true}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />{' '}
          <FormLabel>Adgangskode:</FormLabel>
          <Input
            id="password"
            color="black"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            onKeyPress={handleKeypress}
          />
          <Button
            mt="2"
            w="full"
            color="black"
            bgColor="gray.400"
            disabled={buttonDisabled}
            onClick={handleSubmit}
          >
            Log ind
          </Button>
        </FormControl>

        <FormLabel pt={5}>
          Du skal være logget ind for at benytte denne service.
        </FormLabel>
        <FormLabel>
          Kontakt Jan Rønn på{' '}
          {
            <Link color="blue" href="mailto:jrn@ensure.dk">
              jrn@ensure.dk
            </Link>
          }{' '}
          for mere info.
        </FormLabel>
      </VStack>
      <Toast {...toast}></Toast>
    </Flex>
  );
};

export default Login;

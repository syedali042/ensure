import {useContext} from 'react';
import {
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Stack,
} from '@chakra-ui/react';

import {GlobalContext} from '../../context/GlobalState';

import Loading from '../Reusable/Loading';
import Toast from '../Reusable/Toast';

import LeaserRow from './LeaserRow';
import Message from '../Reusable/Message';

const Leaser = () => {
  const {values, toast, leasers} = useContext(GlobalContext);

  const leasersF = values.fields.leasers.fields;
  return (
    <>
      {leasers ? (
        <Stack w="100%">
          {leasers.length > 0 ? (
            <>
              <Heading size="lg" textAlign="center">
                Eksisterende kunder
              </Heading>

              <HStack pt="5">
                <FormControl id="name" w="20%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Navn
                  </FormLabel>
                </FormControl>
                <FormControl id="email" w="20%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Email
                  </FormLabel>
                </FormControl>
                <FormControl id="policyNumber" w="10%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Policenummer
                  </FormLabel>
                </FormControl>
                <FormControl id="logo" w="10%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Logo
                  </FormLabel>
                </FormControl>
                <FormControl id="roadAssistancePDF" w="10%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Vejhjælp pdf
                  </FormLabel>
                </FormControl>
                <FormControl id="Forbid den" w="10%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Bloker adgang
                  </FormLabel>
                </FormControl>
                <FormControl id="update" w="10%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Opdater
                  </FormLabel>
                </FormControl>
                <FormControl id="update" w="10%">
                  <FormLabel textAlign="center" fontSize="sm">
                    Send registrerings email igen
                  </FormLabel>
                </FormControl>
              </HStack>
              {leasers.map((leaser) => {
                return (
                  <LeaserRow
                    key={leaser[leasersF.recordId.api]}
                    id={leaser[leasersF.recordId.api]}
                    name={leaser[leasersF.name.api]}
                    email={leaser[leasersF.email.api]}
                    policyNumber={leaser[leasersF.policyNumber.api]}
                    roadAssistanceURL={
                      leaser[leasersF.roadAssistance.api]
                        ? `${leaser[leasersF.roadAssistance.api]}`
                        : undefined
                    }
                    logoURL={
                      leaser[leasersF.logo.api]
                        ? `${leaser[leasersF.logo.api]}`
                        : undefined
                    }
                    forbidAccess={
                      leaser[leasersF.forbidAccess.api] ? true : false
                    }
                  />
                );
              })}
              <Divider pt="10" />
              <Heading size="md">Opret ny kunde</Heading>
            </>
          ) : (
            <Message text="Ingen kunder endnu!" height="40vh" />
          )}
          <LeaserRow
            empty
            key="new"
            id="new"
            name=""
            email=""
            policyNumber=""
          />
          <Toast {...toast}></Toast>
        </Stack>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Leaser;

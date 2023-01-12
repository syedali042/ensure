import {useContext, useState, useEffect} from 'react';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Link,
  Image,
  Input,
  Tooltip,
  VStack,
  Heading,
} from '@chakra-ui/react';
import {GrDocumentUpload} from 'react-icons/gr';
import {BsFillFilePdfFill} from 'react-icons/bs';

import utilGeneral from 'util992/functions/general';
import ReactQuill from 'react-quill';
import {useFileUpload} from 'use-file-upload';
import axios from 'axios';

import {GlobalContext} from '../../context/GlobalState';

import Loading from '../Reusable/Loading';
import Toast from '../Reusable/Toast';

import UploadFile from '../Helpers/UploadFile';
import Codes from './Codes';

const User = () => {
  const {values, agent, toast, token, updateAgent, setToast} =
    useContext(GlobalContext);

  const agentsF = values.fields.agents.fields;

  const [startUploadProcess, setStartUploadProcess] = useState({});

  const [picture, selectPicture] = useFileUpload();
  const [logo, selectLogo] = useFileUpload();

  const [insuranceTermsURL, setInsuranceTermsURL] = useState(
    agent[agentsF.insuranceTerms.api]
  );

  const [insuranceTermsPDF, selectInsuranceTermsPDF] = useFileUpload();

  const [disableButton, setDisableButton] = useState(false);

  useEffect(() => {
    setInsuranceTermsURL(agent[agentsF.insuranceTerms.api]);

    // eslint-disable-next-line
  }, [agent]);

  useEffect(() => {
    const checkFileUploaded = ({source, name, size, file}, fileLastUpdated) => {
      if (fileLastUpdated === agentsF.insuranceTerms.api) {
        const maxFileSize = 15728640; // 15 MB

        if (size > maxFileSize)
          return {
            status: false,
            message:
              'Filen er for stor, den maksimale filstørrelse er 15 megabyte',
          };

        if (!file.type.startsWith('application/pdf'))
          return {
            status: false,
            message: 'Filen er ikke en PDF-fil',
          };

        return {status: true};
      } else if (
        fileLastUpdated === agentsF.picture.api ||
        fileLastUpdated === agentsF.logo.api
      ) {
        const maxFileSize = 2097152; // 2 MB

        if (size > maxFileSize)
          return {
            status: false,
            message:
              'Filen er for stor, den maksimale filstørrelse er 2 megabyte',
          };

        if (!file.type.startsWith('image'))
          return {
            status: false,
            message: 'Filen er ikke et billede',
          };

        return {status: true};
      }
    };

    const processFileUpload = ({source, name, size, file}, fileAPIName) => {
      const isValid = checkFileUploaded(
        {
          source,
          name,
          size,
          file,
        },
        fileAPIName
      );
      if (isValid.status) {
        uploadFile(fileAPIName);
      } else {
        setToast({
          title: 'Fejl',
          message: isValid.message,
          status: 'error',
        });
      }
    };

    if (!utilGeneral.isEmptyObject(startUploadProcess)) {
      processFileUpload(
        startUploadProcess.fileObj,
        startUploadProcess.fileName
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startUploadProcess]);

  const uploadFile = async (fileLastUpdated) => {
    const fileObj =
      fileLastUpdated === agentsF.insuranceTerms.api
        ? insuranceTermsPDF
        : fileLastUpdated === agentsF.picture.api
        ? picture
        : fileLastUpdated === agentsF.logo.api
        ? logo
        : null;

    if (fileObj) {
      setDisableButton(true);
      setToast({
        title: 'Bearbejdes',
        message: 'Filen er ved at blive uploadet',
        status: 'info',
      });

      try {
        const url = await UploadFile({
          file: fileObj.file, // File Object to upload
          authToken: token, // the auth token
        });

        await axios.patch(
          `/api/agents`,
          {
            [agentsF.recordId.api]: agent[agentsF.recordId.api],
            [fileLastUpdated]: url,
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        );

        updateAgent({...agent, [fileLastUpdated]: url});

        setToast({
          title: 'Success',
          message: 'Fil opdateret med succes',
          status: 'success',
        });
      } catch (err) {
        return setToast({
          title: 'Fejl',
          message: 'Filen kunne ikke opdateres, prøv venligst igen!',
          status: 'error',
        });
      }

      setDisableButton(false);
    }
  };

  const handleChangeBasic = (e) => {
    const {name, value} = e.target;
    updateAgent({
      ...agent,
      [name]: value,
    });
  };
  const handleChange = ({name, value}) => {
    updateAgent({
      ...agent,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    setDisableButton(true);

    e.preventDefault();

    try {
      setToast({
        title: 'Bearbejdes',
        message: 'Opdaterer oplysningerne',
        status: 'info',
      });

      await axios.patch(
        `/api/agents`,
        {
          [agentsF.recordId.api]: agent[agentsF.recordId.api],
          [agentsF.name.api]: agent[agentsF.name.api],
          [agentsF.email.api]: agent[agentsF.email.api],
          [agentsF.insuranceCompanyEmail.api]:
            agent[agentsF.insuranceCompanyEmail.api],
          [agentsF.terms.api]: agent[agentsF.terms.api],
          [agentsF.guidance.api]: agent[agentsF.guidance.api],
          [agentsF.protector.api]: agent[agentsF.protector.api],
          [agentsF.remark.api]: agent[agentsF.remark.api],
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      setToast({
        title: 'Success',
        message: 'Oplysningerne er blevet opdateret med succes',
        status: 'success',
      });
    } catch (err) {
      setToast({
        title: 'Fejl',
        message: `Kunne ikke opdatere kunden`,
        status: 'error',
      });
    }
    setDisableButton(false);
  };

  return (
    <>
      {!utilGeneral.isEmptyObject(agent) ? (
        <VStack w="100%" alignItems="flex-start">
          <HStack w="100%">
            <VStack w="50%" mr="25%">
              <Tooltip label="Klik for at ændre profilbillede - 200px * 200px">
                <Image
                  h="200px"
                  w="200px"
                  src={
                    agent[agentsF.picture.api]
                      ? agent[agentsF.picture.api]
                      : 'img/avatar.jpg'
                  }
                  alt={`${agent[agentsF.name.api]} Profile Picture`}
                  onClick={async () => {
                    selectPicture(
                      {accept: 'image/*'},
                      ({source, name, size, file}) => {
                        setStartUploadProcess({
                          fileObj: {source, name, size, file},
                          fileName: agentsF.picture.api,
                        });
                      }
                    );
                  }}
                />
              </Tooltip>
              <Box bg="gray.500" minW="50%" textAlign="center" color="white">
                Profilbillede
              </Box>
            </VStack>
            <VStack w="50%" mr="25%">
              <Tooltip label="Klik for at ændre logo - 200px * 200px">
                <Image
                  h="200px"
                  w="200px"
                  src={
                    agent[agentsF.logo.api]
                      ? agent[agentsF.logo.api]
                      : 'img/avatar.jpg'
                  }
                  alt={`${agent[agentsF.name.api]} Logo`}
                  onClick={async () => {
                    await selectLogo(
                      {accept: 'image/*'},
                      ({source, name, size, file}) => {
                        setStartUploadProcess({
                          fileObj: {source, name, size, file},
                          fileName: agentsF.logo.api,
                        });
                      }
                    );
                  }}
                />
              </Tooltip>
              <Box bg="gray.500" minW="50%" textAlign="center" color="white">
                Logo
              </Box>
            </VStack>
          </HStack>
          <VStack w="100%">
            <FormControl id="insurance_company_email" w="100%" my="5">
              <HStack w="100%">
                <FormLabel textAlign={'center'} w="30%">
                  Forsikringsbetingelser
                </FormLabel>
                <Link
                  href={insuranceTermsURL ? insuranceTermsURL : null}
                  isExternal
                  w="35%"
                >
                  <Tooltip label="Forsikringsbetingelser PDF">
                    <IconButton
                      w="100%"
                      icon={<BsFillFilePdfFill />}
                      isDisabled={
                        insuranceTermsURL && !disableButton ? false : true
                      }
                    />
                  </Tooltip>
                </Link>
                <Tooltip label="Upload PDF-filen med forsikringsbetingelser">
                  <IconButton
                    id="pdf-file"
                    w="35%"
                    name="insuranceTermsPDF"
                    icon={<GrDocumentUpload />}
                    disabled={disableButton}
                    onClick={() => {
                      selectInsuranceTermsPDF(
                        {accept: 'application/pdf'},
                        ({source, name, size, file}) => {
                          setStartUploadProcess({
                            fileObj: {source, name, size, file},
                            fileName: agentsF.insuranceTerms.api,
                          });
                        }
                      );
                    }}
                  />
                </Tooltip>
              </HStack>
            </FormControl>
          </VStack>
          <VStack w="100%" mt="10">
            <form
              onSubmit={handleSubmit}
              id={'images-form'}
              style={{width: '100%'}}
            >
              <HStack w="100%">
                <FormControl id="name" w="20%">
                  <FormLabel>Navn</FormLabel>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={agent[agentsF.name.api]}
                    onChange={handleChangeBasic}
                    size="sm"
                  />
                </FormControl>
                <FormControl id="email" w="40%">
                  <FormLabel>E-mail</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={agent[agentsF.email.api]}
                    onChange={handleChangeBasic}
                    size="sm"
                  />
                </FormControl>
                <FormControl id="insurance_company_email" w="40%">
                  <FormLabel>Forsikringsselskab E-mail</FormLabel>
                  <Input
                    type="email"
                    name="insurance_company_email"
                    placeholder="Forsikringsselskab E-mail"
                    value={agent[agentsF.insuranceCompanyEmail.api]}
                    onChange={handleChangeBasic}
                    size="sm"
                  />
                </FormControl>
              </HStack>

              <FormControl id="terms">
                <FormLabel>Vilkår</FormLabel>
                <ReactQuill
                  value={agent[agentsF.terms.api]}
                  onChange={(value) => {
                    handleChange({name: agentsF.terms.api, value});
                  }}
                />
              </FormControl>

              <FormControl id="guidance">
                <FormLabel>Vejledning</FormLabel>
                <ReactQuill
                  value={agent[agentsF.guidance.api]}
                  onChange={(value) => {
                    handleChange({name: agentsF.guidance.api, value});
                  }}
                />
              </FormControl>

              <FormControl id="protector">
                <FormLabel>Sikring</FormLabel>
                <ReactQuill
                  value={agent[agentsF.protector.api]}
                  onChange={(value) => {
                    handleChange({name: agentsF.protector.api, value});
                  }}
                />
              </FormControl>

              <FormControl id="remarks">
                <FormLabel>Bemærkning</FormLabel>
                <ReactQuill
                  value={agent[agentsF.remark.api]}
                  onChange={(value) => {
                    handleChange({name: agentsF.remark.api, value});
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                ml="70%"
                mt="10"
                mb={10}
                w="30%"
                disabled={disableButton}
              >
                Opdater profil info
              </Button>
            </form>
          </VStack>
          <Toast {...toast}></Toast>
        </VStack>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default User;

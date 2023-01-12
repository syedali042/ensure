import {useContext, useState, useEffect} from 'react';

import {
  Button,
  Checkbox,
  FormControl,
  HStack,
  IconButton,
  Input,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import {useFileUpload} from 'use-file-upload';
import axios from 'axios';
import utilGeneral from 'util992/functions/general';
import {GrDocumentUpload} from 'react-icons/gr';
import {BsFillFilePdfFill} from 'react-icons/bs';

import {GlobalContext} from '../../context/GlobalState';

import UploadFile from '../Helpers/UploadFile';

const LeaserRow = (props) => {
  const {values, token, agentId, leasers, updateLeasers, setToast} =
    useContext(GlobalContext);

  const [name, setName] = useState(props.name);
  const [email, setEmail] = useState(props.email);
  const [policyNumber, setPolicyNumber] = useState(props.policyNumber);

  const [roadAssistanceURL, setRoadAssistanceURL] = useState(
    props.roadAssistanceURL
  );
  const [logoURL, setLogoURL] = useState(props.logoURL);
  const [forbidAccess, setForbidAccess] = useState(props.forbidAccess);

  const [roadAssistancePDF, selectRoadAssistancePDF] = useFileUpload();
  const [logo, selectLogo] = useFileUpload();

  const [startUploadProcess, setStartUploadProcess] = useState({});

  const [disableButton, setDisableButton] = useState(false);
  const leasersF = values.fields.leasers.fields;

  useEffect(() => {
    const checkFileUploaded = ({source, name, size, file}, fileLastUpdated) => {
      if (fileLastUpdated === leasersF.roadAssistance.api) {
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
      } else if (fileLastUpdated === leasersF.logo.api) {
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

    const processFileUpload = async (
      {source, name, size, file},
      fileAPIName
    ) => {
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
      fileLastUpdated === leasersF.roadAssistance.api
        ? roadAssistancePDF
        : fileLastUpdated === leasersF.logo.api
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
        if (fileLastUpdated === leasersF.roadAssistance.api)
          setRoadAssistanceURL(url);
        else if (fileLastUpdated === leasersF.logo.api) setLogoURL(url);

        setToast({
          title: 'Fil klar',
          message:
            'Filen er klar, klik på opdater/opret for at tilføje den til kunden',
          status: 'info',
          duration: 3000,
        });
      } catch (err) {
        setToast({
          title: 'Fejl',
          message: `Kan ikke uploade filen/billedet`,
          status: 'error',
          duration: 3000,
        });
      }
      setDisableButton(false);
    }
  };

  const handleChange = (e) => {
    const {name: fieldName, value} = e.target;

    if (fieldName === 'name') {
      setName(value);
    } else if (fieldName === 'email') {
      setEmail(value);
    } else if (fieldName === 'policyNumber') {
      setPolicyNumber(value);
    } else if (fieldName === 'forbidAccess') {
      setForbidAccess(!forbidAccess);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (props.empty) createLeaser();
    else updateLeaser();
  };

  const updateLeaser = async () => {
    setDisableButton(true);

    try {
      setToast({
        title: 'Bearbejdes',
        message: 'Opdaterer oplysningerne',
        status: 'info',
      });

      await axios.patch(
        `/api/leasers`,
        {
          [leasersF.recordId.api]: props.id,
          [leasersF.name.api]: name,
          [leasersF.email.api]: email,
          [leasersF.policyNumber.api]: policyNumber,
          [leasersF.forbidAccess.api]: forbidAccess ? '1' : '0',
          [leasersF.roadAssistance.api]: roadAssistanceURL,
          [leasersF.logo.api]: logoURL,
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

  const createLeaser = async () => {
    if (email) {
      setDisableButton(true);

      try {
        setToast({
          title: 'Bearbejdes',
          message: 'Opretter en kunde',
          status: 'info',
        });

        const valuesRes = await axios.post(
          `/api/leasers`,
          {
            [leasersF.name.api]: name,
            [leasersF.email.api]: email,
            [leasersF.policyNumber.api]: policyNumber,
            [leasersF.agentRecordId.api]: agentId,
            [leasersF.roadAssistance.api]: roadAssistanceURL,
            [leasersF.logo.api]: logoURL,
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        );

        updateLeasers([
          ...leasers,
          {
            [leasersF.recordId.api]: valuesRes.data[leasersF.recordId.api],
            [leasersF.name.api]: name,
            [leasersF.email.api]: email,
            [leasersF.policyNumber.api]: policyNumber,
            [leasersF.forbidAccess.api]: forbidAccess,
            [leasersF.roadAssistance.api]: roadAssistanceURL,
            [leasersF.logo.api]: logoURL,
          },
        ]);

        setName(props.name);
        setEmail(props.email);
        setPolicyNumber(props.policyNumber);
        setForbidAccess(props.forbidAccess);
        setRoadAssistanceURL(props.roadAssistanceURL);
        setRoadAssistanceURL(props.logoURL);

        setToast({
          title: 'Success',
          message: 'Kunde oprettet med succes',
          status: 'success',
        });
      } catch (err) {
        if (
          err.response.data.message ===
          values.strings.errors.twoLeasersSameEmail
        )
          setToast({
            title: 'Fejl',
            message: `En kunde med denne email eksisterer allerede`,
            status: 'error',
          });
        else
          setToast({
            title: 'Fejl',
            message: `Kunne ikke oprette kunden`,
            status: 'error',
          });
      }
    } else {
      setToast({
        title: 'Fejl',
        message: `Kan ikke oprette en kunde uden et navn og en e-mail`,
        status: 'error',
      });
    }
    setDisableButton(false);
  };

  return (
    <form onSubmit={handleSubmit} id={`form-${props.id}`}>
      <HStack>
        <FormControl id="name" w="20%" textAlign="center">
          <Input
            type="text"
            name="name"
            placeholder="Kunde navn"
            value={name}
            onChange={handleChange}
            disabled={disableButton}
            fontSize="sm"
          />
        </FormControl>
        <FormControl id="email" w="20%" textAlign="center">
          <Input
            type="email"
            name="email"
            placeholder="Kunde email"
            value={email}
            onChange={handleChange}
            disabled={disableButton}
            fontSize="sm"
          />
        </FormControl>
        <FormControl id="policyNumber" w="10%" textAlign="center">
          <Input
            type="text"
            name="policyNumber"
            placeholder="Policenummer"
            value={policyNumber}
            onChange={handleChange}
            disabled={disableButton}
            fontSize="sm"
          />
        </FormControl>
        <FormControl id="logo" w="10%">
          <HStack w="100%">
            <Link href={logoURL ? logoURL : null} isExternal w="50%">
              <Tooltip label="Se eksisterende logo">
                <IconButton
                  w="100%"
                  icon={<BsFillFilePdfFill />}
                  isDisabled={logoURL && !disableButton ? false : true}
                />
              </Tooltip>
            </Link>
            <Tooltip label="Upload nyt logo - 200px * 200px">
              <IconButton
                id="pdf-file"
                w="50%"
                name="logo"
                icon={<GrDocumentUpload />}
                disabled={disableButton}
                onClick={() => {
                  selectLogo(
                    {accept: 'image/*'},
                    ({source, name, size, file}) => {
                      setStartUploadProcess({
                        fileObj: {source, name, size, file},
                        fileName: leasersF.logo.api,
                      });
                    }
                  );
                }}
              />
            </Tooltip>
          </HStack>
        </FormControl>
        <FormControl id="roadAssistancePDF" w="10%">
          <HStack w="100%">
            <Link
              href={roadAssistanceURL ? roadAssistanceURL : null}
              isExternal
              w="50%"
            >
              <Tooltip label="Se eksisterende PDF">
                <IconButton
                  w="100%"
                  icon={<BsFillFilePdfFill />}
                  isDisabled={
                    roadAssistanceURL && !disableButton ? false : true
                  }
                />
              </Tooltip>
            </Link>
            <Tooltip label="Upload ny pdf">
              <IconButton
                id="pdf-file"
                w="50%"
                name="roadAssistancePDF"
                icon={<GrDocumentUpload />}
                disabled={disableButton}
                onClick={() => {
                  selectRoadAssistancePDF(
                    {accept: 'application/pdf'},
                    ({source, name, size, file}) => {
                      setStartUploadProcess({
                        fileObj: {source, name, size, file},
                        fileName: leasersF.roadAssistance.api,
                      });
                    }
                  );
                }}
              />
            </Tooltip>
          </HStack>
        </FormControl>
        {props.empty ? (
          <></>
        ) : (
          <FormControl id="check" w="10%" textAlign="center">
            <Checkbox
              size="lg"
              defaultChecked={forbidAccess}
              value={forbidAccess}
              onChange={handleChange}
              name="forbidAccess"
              isDisabled={disableButton ? true : false}
            />
          </FormControl>
        )}
        <Button
          w={props.empty ? '30%' : '10%'}
          bg={props.empty ? 'gray.200' : 'blue.100'}
          type="submit"
          disabled={disableButton}
        >
          {props.empty ? 'Opret kunde' : 'Opdater'}
        </Button>
        {props.empty ? (
          <></>
        ) : (
          <Button
            w="10%"
            bg={props.empty ? 'gray.200' : 'blue.100'}
            disabled={disableButton}
            onClick={() => {
              window.open(`/resend-email/leaser/${props.id}`, '_blank');
            }}
          >
            Send igen
          </Button>
        )}
      </HStack>
    </form>
  );
};

export default LeaserRow;

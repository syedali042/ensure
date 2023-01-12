import {useContext, useState, useEffect} from 'react';

import {Button, VStack, Heading, HStack, Switch} from '@chakra-ui/react';
import CodesFormHeading from '../Reusable/CodesFormHeading';
import CategoryCodesForm from '../Reusable/CategoryCodesForm';
import CodesFormToolBar from '../Reusable/CodesFormToolBar';
import utilGeneral from 'util992/functions/general';
import axios from 'axios';

import {GlobalContext} from '../../context/GlobalState';
import GlobalValues from '../../constants/values';
import Loading from '../Reusable/Loading';
import Toast from '../Reusable/Toast';

const Codes = () => {
  const {
    values,
    agent,
    token,
    agentId,
    updateIsCodeActive,
    updateAgent,
    toast,
    setToast,
  } = useContext(GlobalContext);
  const agentsF = values.fields.agents.fields;
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const {CodeCategories} = GlobalValues;
  const [StilstandCodesForms, setFormCodes] = useState([]);
  const [WithGlassCodesForms, setGlassFormCodes] = useState([]);
  const [WithOutGlassCodesForms, setWithOutGlassFormCodes] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isCodeActive, setIsCodeActive] = useState(
    agent[agentsF.areCodesActive.api] == true ? true : false
  );

  useEffect(() => {
    const getCodes = async () => {
      const valuesRes = await axios.get(`/api/codes/${agentId}`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      const results = valuesRes.data.codes;
      let Still = [];
      let WithGlass = [];
      let WithOutGlass = [];
      results.map((element) => {
        if (element.Category == CodeCategories.stilstand.db) {
          Still.push(
            <CategoryCodesForm
              submitMode={submitMode}
              category={CodeCategories.stilstand.app}
              values={element}
            />
          );
        } else if (
          element.Category == CodeCategories.glasdakning.db &&
          element.Value == true
        ) {
          WithGlass.push(
            <CategoryCodesForm
              submitMode={submitMode}
              category={CodeCategories.glasdakning.app}
              values={element}
            />
          );
        } else if (
          element.Category == CodeCategories.glasdakning.db &&
          (element.Value == false || element.Value == undefined)
        ) {
          WithOutGlass.push(
            <CategoryCodesForm
              submitMode={submitMode}
              category={CodeCategories.withoutglass.app}
              values={element}
            />
          );
        }
      });
      setFormCodes(
        Still
        //   Still.length > 0
        //   ?
        //   : [
        //       <CategoryCodesForm
        //         submitMode={submitMode}
        //         category={CodeCategories.stilstand.app}
        //       />,
        //     ]
      );
      setGlassFormCodes(
        WithGlass
        // WithGlass.length > 0
        //   : [
        //       <CategoryCodesForm
        //         submitMode={submitMode}
        //         category={CodeCategories.glasdakning.app}
        //       />,
        //     ]
      );
      setWithOutGlassFormCodes(
        WithOutGlass
        // WithOutGlass.length > 0
        //   ? WithOutGlass
        //   : [
        //       <CategoryCodesForm
        //         submitMode={submitMode}
        //         category={CodeCategories.withoutglass.app}
        //       />,
        //     ]
      );
    };
    getCodes();
  }, []);

  const returnObject = (Category, Value, code, minValue, maxValue) => {
    return {
      Category: Category,
      Value: Value,
      code: code,
      minValue: minValue,
      maxValue: maxValue,
    };
  };

  const convertValue = (value) => {
    let newValue = value.replaceAll('.', '');
    let otherNewValue = newValue.replaceAll(',', '.');
    return otherNewValue;
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    let values = [];
    let errors = [];
    const {category, code, minValue, maxValue} = e.target;
    if (category !== undefined) {
      if (category.length !== undefined) {
        for (let i = 0; i < code.length; i++) {
          let co = code[i].value;
          let cat = category[i].value;
          let min = parseFloat(convertValue(minValue[i].value));
          let max = parseFloat(convertValue(maxValue[i].value));
          if (cat !== '' && min !== '' && max !== '') {
            if (min < max) {
              if (
                category[i + 1] !== undefined &&
                cat == category[i + 1].value
              ) {
                if (max < parseFloat(convertValue(minValue[i + 1].value))) {
                  values.push(
                    returnObject(
                      CodeCategories[cat].db,
                      CodeCategories[cat].app ==
                        CodeCategories.withoutglass.app ||
                        CodeCategories[cat].app == CodeCategories.stilstand.app
                        ? false
                        : true,
                      co,
                      min,
                      max
                    )
                  );
                } else {
                  errors.push({index: i, type: 'b'});
                  setIsLoading(false);
                }
              } else {
                values.push(
                  returnObject(
                    CodeCategories[cat].db,
                    CodeCategories[cat].app ==
                      CodeCategories.withoutglass.app ||
                      CodeCategories[cat].app == CodeCategories.stilstand.app
                      ? false
                      : true,
                    co,
                    min,
                    max
                  )
                );
              }
            } else {
              errors.push({index: i, type: 'a'});
              setIsLoading(false);
            }
          } else {
            errors.push({index: i, type: 'c'});
            setIsLoading(false);
          }
        }
      } else {
        if (
          category.value !== '' &&
          parseFloat(convertValue(minValue.value)) !== '' &&
          parseFloat(convertValue(maxValue.value)) !== ''
        ) {
          if (
            parseFloat(convertValue(minValue.value)) <
            parseFloat(convertValue(maxValue.value))
          ) {
            values.push(
              returnObject(
                CodeCategories[category.value].db,
                CodeCategories[category.value].app ==
                  CodeCategories.withoutglass.app ||
                  CodeCategories[category.value].app ==
                    CodeCategories.stilstand.app
                  ? false
                  : true,
                code.value,
                parseFloat(convertValue(minValue.value)),
                parseFloat(convertValue(maxValue.value))
              )
            );
          } else {
            errors.push({index: 0, type: 'a'});
            setIsLoading(false);
          }
        } else {
          errors.push({index: 0, type: 'c'});
          setIsLoading(false);
        }
      }
    }
    if (errors.length !== 0) {
      errors.forEach((e) => {
        document.getElementsByClassName('form-element')[e.index].style.border =
          '1px solid red';
        document.getElementsByClassName('form-element')[e.index].style.padding =
          '5px';
        document.getElementsByClassName('form-element')[
          e.index
        ].style.borderRadius = '3px';
        if (e.type == 'a') {
          let newPara = document.createElement('p');
          newPara.classList.add('error-text');
          newPara.style.textAlign = 'center';
          newPara.style.color = 'red';
          newPara.innerText =
            'Den maksimale værdi skal være større end den mindste værdi';
          document
            .getElementsByClassName('form-element')
            [e.index].appendChild(newPara);
        } else if (e.type == 'b') {
          let newPara = document.createElement('p');
          newPara.classList.add('error-text');
          newPara.style.textAlign = 'center';
          newPara.style.color = 'red';
          newPara.innerText =
            'Næste rækkes minimumsværdi skal være større end denne rækkes maksimumsværdi';
          document
            .getElementsByClassName('form-element')
            [e.index].appendChild(newPara);
        } else if (e.type == 'c') {
          let newPara = document.createElement('p');
          newPara.classList.add('error-text');
          newPara.style.textAlign = 'center';
          newPara.style.color = 'red';
          newPara.innerText =
            'Kode, minimumsværdi, maksimumsværdi kan ikke være tom';
          document
            .getElementsByClassName('form-element')
            [e.index].appendChild(newPara);
        }
      });
      setTimeout(() => {
        errors.forEach((e) => {
          document.getElementsByClassName('form-element')[
            e.index
          ].style.border = '0px';
          document.getElementsByClassName('form-element')[
            e.index
          ].style.padding = '0px';
          document.getElementsByClassName('form-element')[
            e.index
          ].style.borderRadius = '0px';
        });
        document.querySelectorAll('.error-text').forEach((e) => e.remove());
      }, 5000);
    } else {
      const request = await axios.post(
        '/api/codes/add',
        {Agent: agent.agent_id, codes: values},
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      if (request.data.code === 201) {
        setIsLoading(false);
        setToast({
          title: 'Success',
          message: 'Koder gemt succesfuldt.',
          status: 'success',
        });
      } else if (request.data.code === 400) {
        setIsLoading(false);
        setToast({
          title: 'Error',
          message: 'Koder gemt succesfuldt.',
          status: 'error',
        });
      } else {
        setToast({
          title: 'Success',
          message: 'Koderne kunne ikke gemmes.',
          status: 'success',
        });
      }
    }
  };
  const submitMode = (status) => {
    setIsDisabled(status);
  };

  const handleCodeChange = async (element) => {
    element.preventDefault();
    if (element.target.checked == true) {
      localStorage.setItem('isCodeActive', true);
      try {
        await axios.patch(
          `/api/agents`,
          {
            [agentsF.recordId.api]: agent[agentsF.recordId.api],
            [agentsF.areCodesActive.api]: true,
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        );
      } catch (err) {
        setToast({
          title: 'Error',
          message: `Something Went Wrong`,
          status: 'error',
        });
      }
      if (localStorage.getItem('isCodeActive') == 'true') {
        setIsCodeActive(true);
        setToast({
          title: 'Success',
          message: `Kodeindstillinger blev aktiveret med succes`,
          status: 'success',
        });
      } else {
        setToast({
          title: 'Failure',
          message: `Koderindstillingerne kunne ikke aktiveres`,
          status: 'error',
        });
      }
    } else if (element.target.checked == false) {
      localStorage.setItem('isCodeActive', false);
      try {
        await axios.patch(
          `/api/agents`,
          {
            [agentsF.recordId.api]: agent[agentsF.recordId.api],
            [agentsF.areCodesActive.api]: false,
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        );
      } catch (err) {
        setToast({
          title: 'Error',
          message: `Something Went Wrong`,
          status: 'error',
        });
      }
      if (localStorage.getItem('isCodeActive') == 'false') {
        setIsCodeActive(false);
        setToast({
          title: 'Success',
          message: `Kodeindstillingerne blev deaktiveret med succes`,
          status: 'success',
        });
      } else {
        setToast({
          title: 'Failure',
          message: `Kodeindstillingerne kunne ikke deaktiveres`,
          status: 'error',
        });
      }
    }
  };

  return (
    <>
      {!utilGeneral.isEmptyObject(agent) ? (
        <>
          <form
            action="javascript://"
            id={'images-form'}
            onSubmit={handleSubmit}
            style={{width: '100%', marginTop: '30px', padding: '0% 10%'}}
          >
            <Heading fontSize={'36'}>
              {/* Codes */}
              Certifikat koder
            </Heading>
            <HStack
              alignItems={'center'}
              mt={8}
              justifyContent={'space-between'}
            >
              <HStack>
                <Heading fontSize={'16'}>
                  {/* Are code active ? */}
                  Er koderne aktiveret?
                </Heading>
                <Switch
                  defaultChecked={isCodeActive}
                  onChange={(checked) => handleCodeChange(checked)}
                />
              </HStack>
            </HStack>
            {/* Still Stand Section */}
            <VStack w="100%">
              <CodesFormToolBar
                array={StilstandCodesForms}
                target={setFormCodes}
                category={CodeCategories.stilstand.app}
                // title="StilStand"
                title="Stilstand"
                submitMode={submitMode}
              />
              <CodesFormHeading />
              {StilstandCodesForms.map((element) => element)}
            </VStack>
            <div style={{marginTop: '15px', marginBottom: '15px'}}>
              <hr />
            </div>
            {/* With Glass Section */}
            <VStack w="100%">
              <CodesFormToolBar
                array={WithGlassCodesForms}
                target={setGlassFormCodes}
                category={CodeCategories.glasdakning.app}
                // title="With Glass"
                title="Med glasdækning"
                submitMode={submitMode}
              />
              <CodesFormHeading />
              {WithGlassCodesForms.map((element) => element)}
            </VStack>
            <div style={{marginTop: '15px', marginBottom: '15px'}}>
              <hr />
            </div>
            {/* Without Glass Section */}
            <VStack w="100%">
              <CodesFormToolBar
                array={WithOutGlassCodesForms}
                target={setWithOutGlassFormCodes}
                category={CodeCategories.withoutglass.app}
                // title="Without Glass"
                title="Uden glasdækning"
                submitMode={submitMode}
              />
              <CodesFormHeading />
              {WithOutGlassCodesForms.map((element) => element)}
            </VStack>
            <div style={{marginTop: '15px', marginBottom: '15px'}}>
              <hr />
            </div>
            <Button
              width={'20%'}
              marginBottom={'105px'}
              float={'right'}
              maxWidth={'200px'}
              isLoading={isLoading}
              isDisabled={isDisabled}
              type={'submit'}
              colorScheme="blue"
            >
              {/* Update Codes */}
              Opdater koder
            </Button>
            <br />
            <br />
          </form>
        </>
      ) : (
        <Loading />
      )}
      <div style={{marginTop: 10, marginBottom: 10}}>
        <hr />
      </div>
      <Toast {...toast}></Toast>
    </>
  );
};
export default Codes;

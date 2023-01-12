import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
  Heading,
} from '@chakra-ui/react';
import NumberFormat from 'react-number-format';
const CategoryCodesForm = ({category, values, submitMode}) => {
  console.log(category, 'Values ==>', values);
  let initialValues;
  if (values !== undefined) {
    initialValues = {
      category: category,
      code: values.code,
      minValue: values.minValue,
      maxValue: values.maxValue,
    };
  } else {
    initialValues = {
      category: category,
      code: '',
      minValue: '',
      maxValue: '',
    };
  }

  const handleChangeBasic = (e) => {
    submitMode(false);
    let input = e.target.id;
    initialValues[input] = e.target.value;
  };

  return (
    <>
      <VStack w="100%" mt="2" mb="5" className="form-element">
        <HStack w="100%">
          <FormControl id="category" display={'none'}>
            <Input
              type="text"
              name="category[]"
              value={initialValues.category}
            />
          </FormControl>
          <FormControl id="code" w="33.33%">
            <Input
              type="text"
              name="code[]"
              // placeholder="Code"
              placeholder="Kode"
              onChange={handleChangeBasic}
              size="sm"
              defaultValue={initialValues.code}
            />
          </FormControl>
          <FormControl id="minValue" w="33.33%">
            <NumberFormat
              id="minValue"
              thousandSeparator={'.'}
              decimalSeparator={','}
              type="text"
              name="minValue[]"
              // placeholder="Minimum Value"
              placeholder="Min værdi"
              onChange={handleChangeBasic}
              defaultValue={initialValues.minValue}
              size="sm"
            />
          </FormControl>
          <FormControl id="maxValue" w="33.33%">
            <NumberFormat
              id="maxValue"
              thousandSeparator={'.'}
              decimalSeparator={','}
              type="text"
              name="maxValue[]"
              // placeholder="Maximum Value"
              placeholder="Max værdi"
              onChange={handleChangeBasic}
              defaultValue={initialValues.maxValue}
              size="sm"
            />
          </FormControl>
        </HStack>
      </VStack>
    </>
  );
};
export default CategoryCodesForm;

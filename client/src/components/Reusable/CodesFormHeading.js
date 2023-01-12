import {FormControl, FormLabel, HStack, VStack} from '@chakra-ui/react';
const CodesFormHeading = () => {
  return (
    <VStack w="100%" mt="2" mb="5">
      <HStack w="100%">
        <FormControl ml={2} w="33.33%">
          <FormLabel>
            {/* Code */}
            Kode
          </FormLabel>
        </FormControl>
        <FormControl ml={2} w="33.33%">
          <FormLabel>
            {/* Min Value */}
            Min værdi
          </FormLabel>
        </FormControl>
        <FormControl ml={2} w="33.33%">
          <FormLabel>
            {/* Max Value */}
            Max værdi
          </FormLabel>
        </FormControl>
      </HStack>
    </VStack>
  );
};
export default CodesFormHeading;

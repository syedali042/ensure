import {
  Box,
  Center,
  Divider,
  Heading,
  Spacer,
  Spinner,
  VStack,
} from '@chakra-ui/react';

const Loading = ({message = 'Loading'}) => {
  return (
    <Box w="100%">
      <Center h="100vh" w="100%">
        <VStack>
          <Heading size="md" textAlign="center">
            {message}
          </Heading>
          <Divider></Divider>
          <Spacer></Spacer>
          <Spacer></Spacer>
          <Spacer></Spacer>
          <Spinner></Spinner>
        </VStack>
      </Center>
    </Box>
  );
};

export default Loading;

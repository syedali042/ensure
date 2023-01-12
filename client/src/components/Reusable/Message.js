import {Box, Center, Divider, Heading, VStack} from '@chakra-ui/react';

const Message = ({text = '', height = '100vh', width = '100%'}) => {
  return (
    <Box w="100%">
      <Center h={height} w={width}>
        <VStack>
          <Heading size="md" textAlign="center">
            {text}
          </Heading>
          <Divider></Divider>
        </VStack>
      </Center>
    </Box>
  );
};

export default Message;

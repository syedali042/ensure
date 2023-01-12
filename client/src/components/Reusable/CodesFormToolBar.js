import {Button, Heading} from '@chakra-ui/react';
import CategoryCodesForm from './CategoryCodesForm';
const CodesFormToolBar = ({array, target, category, title, submitMode}) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <Heading as="h4" size="md" mt={5} mb={5}>
          {title}
        </Heading>
      </div>
      <div>
        <Button
          size={'sm'}
          bg="#BCDDF5"
          color={'#1A1D27'}
          mt={'1%'}
          onClick={() => {
            submitMode(false);
            target(array.concat(<CategoryCodesForm category={category} />));
          }}
        >
          {/* Add New Row */}
          Tilføj ny linje
        </Button>
        &nbsp;
        <Button
          size={'sm'}
          colorScheme="red"
          mt={'1%'}
          onClick={() => {
            submitMode(false);
            target(
              array.filter((element, index) => index !== array.length - 1)
            );
          }}
        >
          {/* Remove Row */}
          Fjern linje
        </Button>
      </div>
    </div>
  );
};

export default CodesFormToolBar;

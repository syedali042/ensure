import {useContext} from 'react';
import {Flex, Text, Icon, Link, Menu, MenuButton} from '@chakra-ui/react';

import {GlobalContext} from '../../context/GlobalState';

const NavItem = ({title, icon, active, setMenuSectionSelected, isLogout}) => {
  const {navExpanded, logoutClear, updateSection} = useContext(GlobalContext);

  return (
    <Flex
      mt={30}
      flexDir="column"
      w="100%"
      alignItems={navExpanded ? 'flex-start' : 'center'}
    >
      <Menu placement="right">
        <Link
          backgroundColor={active && '#55ABDF'}
          p={3}
          borderRadius={8}
          _hover={{textDecor: 'none', backgroundColor: '#55ABDF'}}
          w={navExpanded && '100%'}
          color={active ? 'white' : 'black'}
          onClick={() => {
            if (isLogout) {
              logoutClear();
            } else {
              setMenuSectionSelected(title);
              updateSection(title);
            }
          }}
        >
          <MenuButton w="100%">
            <Flex>
              <Icon
                as={icon}
                fontSize="xl"
                color={active ? 'white' : 'black'}
              />
              <Text
                wordBreak="break-word"
                w="100%"
                display={navExpanded ? 'small' : 'none'}
                ml={3}
                textAlign="left"
              >
                {title}
              </Text>
            </Flex>
          </MenuButton>
        </Link>
      </Menu>
    </Flex>
  );
};

export default NavItem;

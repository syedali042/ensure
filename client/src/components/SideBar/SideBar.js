import {useContext, useState} from 'react';
import {
  Flex,
  Text,
  IconButton,
  Divider,
  Avatar,
  Heading,
} from '@chakra-ui/react';
import NavItem from './NavItem';
import {FiMenu, FiUser, FiLogOut, FiServer} from 'react-icons/fi';

import {BsPeopleFill} from 'react-icons/bs';

import {MdOutlinePendingActions} from 'react-icons/md';

import {GlobalContext} from '../../context/GlobalState';

const SideBar = () => {
  const {values, navExpanded, toggleNavExpanded, agent} =
    useContext(GlobalContext);

  const agentsF = values.fields.agents.fields;

  const sections = [
    {
      title: values.g.sectionsTitles.user,
      icon: FiUser,
    },
    {
      title: values.g.sectionsTitles.leasers,
      icon: BsPeopleFill,
    },
    {
      title: values.g.sectionsTitles.entries,
      icon: MdOutlinePendingActions,
    },
    {
      title: values.g.sectionsTitles.codes,
      icon: FiServer,
    },
  ];

  const [menuSectionSelected, setMenuSectionSelected] = useState(
    sections[0].title
  );

  return (
    <Flex
      style={{position: 'sticky', top: '1vh', bottom: '1vh'}}
      h="98vh"
      w={navExpanded ? '20vw' : '5vw'}
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      borderRadius={navExpanded ? '30px' : '15px'}
      flexDir="column"
      justifyContent="space-between"
    >
      <Flex
        p="5%"
        flexDir="column"
        alignItems={navExpanded ? 'flex-start' : 'center'}
        as="nav"
      >
        <IconButton
          background="gray.300"
          mt={5}
          _hover={{background: 'gray.400'}}
          icon={<FiMenu />}
          color="black"
          onClick={() => {
            toggleNavExpanded();
          }}
        ></IconButton>
        {sections.map((section) => {
          return (
            <NavItem
              key={section.title}
              navExpanded={navExpanded}
              title={section.title}
              icon={section.icon}
              active={menuSectionSelected === section.title}
              setMenuSectionSelected={setMenuSectionSelected}
            />
          );
        })}
      </Flex>
      <Flex
        p="5%"
        flexDir="column"
        w="100%"
        alignItems={navExpanded ? 'flex-start' : 'center'}
      >
        <Divider display={navExpanded ? 'flex' : 'none'} />
        <NavItem title="Log ud" icon={FiLogOut} isLogout />

        <Flex mt={4} align="center">
          <Avatar
            size="sm"
            src={
              agent[agentsF.picture.api]
                ? agent[agentsF.picture.api]
                : 'img/avatar.jpg'
            }
          />
          <Flex flexDir="column" ml={4} display={navExpanded ? 'flex' : 'none'}>
            <Heading as="h3" size="sm">
              {agent[agentsF.name.api]}
            </Heading>
            <Text wordBreak="break-word" color="gray">
              Forsikringsmægler
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default SideBar;

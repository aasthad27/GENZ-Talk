import { 
  Container,
  Box,
  Text ,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} 
from '@chakra-ui/react';
import React from 'react';
import  {useEffect} from 'react';
import Login from "../components/Authentication/Login";    
import Signup from "../components/Authentication/Signup";  
import {useHistory} from "react-router"; 
const HomePage = () => { // already login push it to chat page 
  const history=useHistory();
  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem("userInfo"));
    if(user)
    history.push("/chats");
  },[history]);
  return <Container maxW='xl' centerContent>
  <Box
  d='flex'
  justifyContent="center"
  textAlign={"center"}
  p={1}
  bg={"white"}
  w="100%"
  m="40px 0 15px 0"
  borderRadius="lg"
  borderColor={"black"}
  borderWidth="1px"
  >
   <Text fontSize="3xl" fontFamily="Work sans" color={"balck"}>Zen-Talk</Text>
  </Box>
  < Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
    <Tabs variant='soft-rounded' >
  <TabList mb='1em'>
    <Tab width="50%">Login</Tab>
    <Tab width="50%">Sign Up</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>{ <Login/>}</TabPanel>
    <TabPanel>{ <Signup/> }</TabPanel>
  </TabPanels>
</Tabs>
  </Box>
  </Container>;
  
};

export default HomePage
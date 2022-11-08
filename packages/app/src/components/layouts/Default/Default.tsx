import { Box, Container, Flex, HStack, Icon, Link, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { FaGithub } from "react-icons/fa";

export interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <Flex minHeight={"100vh"} direction={"column"}>
      <Container as="section" maxW="8xl">
        <Box as="nav" py="4">
          <Flex justify="space-between" alignItems={"center"} h="8">
            <Link href="/">
              <Text fontSize="md" fontWeight={"bold"}>
                CrossFarm 🌽
              </Text>
            </Link>
            <HStack>
              <ConnectButton accountStatus={"address"} showBalance={false} chainStatus={"name"} />
            </HStack>
          </Flex>
        </Box>
      </Container>
      <Container maxW="6xl" py="4" flex={1}>
        {children}
      </Container>
      <Container maxW="8xl">
        <HStack justify={"space-between"}>
          <Text fontSize={"xs"} color="gray.400" fontWeight={"medium"} py="4">
            <Link href="https://moralis.io/google-hackathon/" target={"_blank"}>
              😘 Moralis x Google 2022 Hackathon
            </Link>
          </Text>
          <Link href="https://github.com/taijusanagi/crossfarm" target={"_blank"}>
            <Icon as={FaGithub} aria-label="github" color="gray.400" />
          </Link>
        </HStack>
      </Container>
    </Flex>
  );
};

import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NextHead from "next/head";
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";

export interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const disclosure = useDisclosure();

  const [mode, setMode] = useState<"lp" | "app">("lp");

  return (
    <>
      <NextHead>
        <title>CrossFarm</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta property="og:url" content={"https://crossfarm.vercel.app/"} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={"CrossFarm"} />
        <meta property="og:site_name" content={"CrossFarm"} />
        <meta property="og:description" content={"Automated cross-chain yield aggregator with Axeler"} />
        <meta property="og:image" content={`https://crossfarm.vercel.app/img/key.png`} />
        <meta name="twitter:card" content={"summary_large_image"} />
      </NextHead>
      <Flex minHeight={"100vh"} direction={"column"}>
        {mode === "lp" && (
          <Box position="relative">
            <Image src="/img/top.png" alt="top" h={"100vh"} w={"100vw"} objectFit="fill" position="absolute" />
            <Box h={"100vh"} w={"100vw"} position="absolute" bgColor={"rgba(0, 0, 0, 0.8)"} />
            <Center h={"100vh"} w={"100vw"} position="absolute" p="4">
              <Stack spacing="12">
                <Stack spacing="0">
                  <HStack justify={"center"}>
                    <Text color="green.500" fontSize="7xl" fontWeight={"bold"} textAlign="center">
                      CrossFarm
                    </Text>
                    <Image src="/img/corn.png" alt="logo" h="12" />
                  </HStack>
                  <Text color="white" fontSize="xl" textAlign="center">
                    Auto crosschain yield aggregator with Axeler
                  </Text>
                </Stack>
                <Button onClick={() => setMode("app")} colorScheme={"green"} fontWeight="bold">
                  Start
                </Button>
              </Stack>
            </Center>
          </Box>
        )}
        {mode === "app" && (
          <>
            <Container as="section" maxW="8xl">
              <Box as="nav" py="4">
                <Flex justify="space-between" alignItems={"center"} h="8">
                  <Link href="/">
                    <Image src="/img/corn.png" alt="logo" h="6" />
                  </Link>
                  <HStack>
                    <ConnectButton accountStatus={"address"} showBalance={false} chainStatus={"name"} />
                  </HStack>
                </Flex>
              </Box>
            </Container>
            <Container maxW="xl" py="4" flex={1}>
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
          </>
        )}
      </Flex>
    </>
  );
};

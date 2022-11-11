import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Image,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";
import { useAccountTokenAmount } from "@/hooks/useAccountTokenAmount";
import { useAPY } from "@/hooks/useAPY";
import { useChainId } from "@/hooks/useChainId";
import { ChainId, isChainId } from "@/types/ChainId";

import network from "../../../contracts/network.json";

const HomePage: NextPage = () => {
  const { chainId } = useChainId();
  const { isAccountTokenAmountLoading, isAccountTokenAmountEnough, accountTokenAmount, fetchAccountTokenAmount } =
    useAccountTokenAmount();
  const apy = useAPY();
  const plantModalDisclosure = useDisclosure();
  const harvestModalDisclosure = useDisclosure();
  const [plantModalStatus, setPlantModalStatus] = useState<"selectAsset" | "inputAmount" | "selectNetwork" | "preview">(
    "selectAsset"
  );
  const [harvestModalStatus, setHarvestModalStatus] = useState<
    "selectAsset" | "inputAmount" | "selectNetwork" | "preview"
  >("selectAsset");
  const [inputPlantAmount, setInputPlantAmount] = useState("1");
  const [inputHarvestAmount, setInputHarvestAmount] = useState("1");

  const [selectedChainId, setSelectedChainId] = useState<ChainId>("80001");
  const [isStaked, setIsStaked] = useState(false);

  const setSelectedChainIdWithTypeCheck = (chainId: string) => {
    if (!isChainId(chainId)) {
      return;
    }
    setSelectedChainId(chainId);
  };

  return (
    <DefaultLayout>
      <Stack spacing="4">
        <Unit header="Farm Status" description="This is your staking status">
          <Flex justify="right">
            <Button
              onClick={() => {
                setPlantModalStatus("selectAsset");
                fetchAccountTokenAmount();
                plantModalDisclosure.onOpen();
              }}
              colorScheme={chainId === "5" ? "brand" : "gray"}
              size="sm"
              disabled={chainId !== "5"}
            >
              {chainId !== "5" ? "Connect Georli" : "Plant"}
            </Button>
            <Modal header="Plant" isOpen={plantModalDisclosure.isOpen} onClose={plantModalDisclosure.onClose}>
              {plantModalStatus === "selectAsset" && (
                <Stack spacing="4">
                  <Button
                    p="4"
                    boxShadow={"md"}
                    borderRadius="2xl"
                    fontSize="sm"
                    isLoading={isAccountTokenAmountLoading}
                    loadingText={"Loading"}
                    disabled={!isAccountTokenAmountEnough}
                    onClick={() => setPlantModalStatus("inputAmount")}
                  >
                    aUSDC {!isAccountTokenAmountEnough && "( Not Enough )"}
                  </Button>
                </Stack>
              )}
              {plantModalStatus === "inputAmount" && (
                <Stack spacing="4">
                  <FormControl>
                    <Flex justify={"space-between"}>
                      <FormLabel>Amount</FormLabel>
                      <FormLabel fontSize="xs">Max: {accountTokenAmount}</FormLabel>
                    </Flex>
                    <Input
                      type="number"
                      placeholder={"aUSDC"}
                      value={inputPlantAmount}
                      onChange={(e) => setInputPlantAmount(e.target.value)}
                    />
                  </FormControl>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputPlantAmount}
                      onClick={() => setPlantModalStatus("selectAsset")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputPlantAmount}
                      onClick={() => setPlantModalStatus("selectNetwork")}
                      colorScheme="brand"
                    >
                      Next
                    </Button>
                  </HStack>
                </Stack>
              )}
              {plantModalStatus === "selectNetwork" && (
                <Stack spacing="8">
                  <FormControl>
                    <RadioGroup onChange={setSelectedChainIdWithTypeCheck} value={selectedChainId}>
                      <Stack>
                        <Radio value="80001">Polygon Mumbai - {apy["80001"]}%</Radio>
                        <Radio value="97">BNB Testnet - {apy["97"]}%</Radio>
                        <Radio value="4002">Fantom Testnet - {apy["4002"]}%</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      onClick={() => setPlantModalStatus("inputAmount")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      onClick={() => setPlantModalStatus("preview")}
                      colorScheme="brand"
                    >
                      Next
                    </Button>
                  </HStack>
                </Stack>
              )}
              {plantModalStatus === "preview" && (
                <Stack spacing="8">
                  <Stack spacing="2">
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Amount
                      </Text>
                      <Text fontSize="sm">{inputPlantAmount} aUSDC</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Bridge Protocol
                      </Text>
                      <Text fontSize="sm">Axelar</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Source Chain
                      </Text>
                      <Text fontSize="sm">Georli</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Target Chain
                      </Text>
                      <Text fontSize="sm">{network[selectedChainId].name}</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Expected APY
                      </Text>
                      <Text fontSize="sm">{apy[selectedChainId]}%</Text>
                    </Stack>
                  </Stack>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      onClick={() => setPlantModalStatus("selectNetwork")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      onClick={() => {
                        setIsStaked(true);
                        plantModalDisclosure.onClose();
                      }}
                      colorScheme="brand"
                    >
                      Confirm
                    </Button>
                  </HStack>
                </Stack>
              )}
            </Modal>
          </Flex>

          <Center p="12" h="200" position="relative">
            <Image src="/img/base.png" alt="base" h="200" position="absolute" top="0" />
            {isStaked && <Image src="/img/corn.png" alt="corn" h="12" position="absolute" top="10" />}
          </Center>
        </Unit>
        <Unit header="Farm Detail" description="This is your staking detail">
          <Flex justify="right">
            <Button
              onClick={() => {
                setHarvestModalStatus("selectAsset");
                harvestModalDisclosure.onOpen();
              }}
              size="sm"
              colorScheme={isStaked ? "brand" : "gray"}
              disabled={!isStaked}
            >
              Harvest
            </Button>
            <Modal header="Harvest" isOpen={harvestModalDisclosure.isOpen} onClose={harvestModalDisclosure.onClose}>
              {harvestModalStatus === "selectAsset" && (
                <Stack spacing="4">
                  <Button
                    p="4"
                    boxShadow={"md"}
                    borderRadius="2xl"
                    fontSize="sm"
                    isLoading={isAccountTokenAmountLoading}
                    loadingText={"Loading"}
                    disabled={!isAccountTokenAmountEnough}
                    onClick={() => setHarvestModalStatus("selectNetwork")}
                  >
                    aUSDC {!isAccountTokenAmountEnough && "( Not Enough )"}
                  </Button>
                </Stack>
              )}
              {harvestModalStatus === "selectNetwork" && (
                <Stack spacing="8">
                  <FormControl>
                    <RadioGroup onChange={setSelectedChainIdWithTypeCheck} value={selectedChainId}>
                      <Stack>
                        <Radio value="5">Ethereum Georli</Radio>
                        <Radio value="80001">Polygon Mumbai</Radio>
                        <Radio value="97">BNB Testnet</Radio>
                        <Radio value="4002">Fantom Testnet</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setHarvestModalStatus("selectAsset")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setPlantModalStatus("preview")}
                      colorScheme="brand"
                    >
                      Next
                    </Button>
                  </HStack>
                </Stack>
              )}
              {harvestModalStatus === "preview" && (
                <Stack spacing="8">
                  <Stack spacing="2">
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Amount
                      </Text>
                      <Text fontSize="sm">{inputAmount} aUSDC</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Bridge Protocol
                      </Text>
                      <Text fontSize="sm">Axelar</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Source Chain
                      </Text>
                      <Text fontSize="sm">{network[selectedChainId].name}</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Target Chain
                      </Text>
                      <Text fontSize="sm">{network[selectedChainId].name}</Text>
                    </Stack>
                  </Stack>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => setPlantModalStatus("selectNetwork")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputAmount}
                      onClick={() => {
                        setIsStaked(true);
                        plantModalDisclosure.onClose();
                      }}
                      colorScheme="brand"
                    >
                      Confirm
                    </Button>
                  </HStack>
                </Stack>
              )}
            </Modal>
          </Flex>
        </Unit>
      </Stack>
    </DefaultLayout>
  );
};

export default HomePage;

import {
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useState } from "react";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";
import { useAccountTokenAmount } from "@/hooks/useAccountTokenAmount";
import { useAddresses } from "@/hooks/useAddresses";
import { useAPY } from "@/hooks/useAPY";
import { useChainId } from "@/hooks/useChainId";
import { useContracts } from "@/hooks/useContracts";
import { useIsWagmiConnected } from "@/hooks/useIsWagmiConnected";

import networkJsonFile from "../../../contracts/network.json";
import { ChainId, isChainId } from "../../../contracts/types/ChainId";

const HomePage: NextPage = () => {
  const { chainId } = useChainId();
  const contracts = useContracts();

  const { isWagmiConnected } = useIsWagmiConnected();
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
  const [asset] = useState("aUSDC");
  const [inputPlantAmount, setInputPlantAmount] = useState("1");
  const [inputHarvestAmount, setInputHarvestAmount] = useState("1");
  const [selectedChainId, setSelectedChainId] = useState<ChainId>("5");
  const [isStaked, setIsStaked] = useState(false);

  const setSelectedChainIdWithTypeCheck = (chainId: string) => {
    if (!isChainId(chainId)) {
      return;
    }
    setSelectedChainId(chainId);
  };

  const plant = async () => {
    if (!contracts || !addresses) {
      return;
    }
    if (chainId === selectedChainId) {
      // chech approve
      await contracts.vault.deposit(inputPlantAmount);
    } else {
      // string memory destinationChain,
      // string memory destinationAddress,
      // string memory tokenSymbol,
      // uint256 tokenAmount,
      // address vaultAddress
      const amount = ethers.utils.parseUnits(inputPlantAmount, 6);

      await contracts.crossFarm.xPlant(
        selectedChainId,
        networkJsonFile[selectedChainId].deployments.crossFarm,
        asset,
        amount,
        networkJsonFile[selectedChainId].deployments.vault
      );
    }
  };

  return (
    <DefaultLayout>
      <Unit header="CrossFarm" description="Automated crosschain yield aggregator portal  ">
        <Stack spacing="8">
          <Flex justify="space-between">
            <Button
              onClick={() => {
                setPlantModalStatus("selectAsset");
                fetchAccountTokenAmount();
                plantModalDisclosure.onOpen();
              }}
              colorScheme={"brand"}
              size="sm"
              disabled={!isWagmiConnected}
            >
              Plant
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
                      <Stack spacing="4">
                        {Object.entries(networkJsonFile).map(([chainId, value]) => {
                          return (
                            <Radio key={chainId} value={chainId}>
                              {value.name} - {apy[chainId]}%
                            </Radio>
                          );
                        })}
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
                      <Text fontSize="sm">{networkJsonFile[selectedChainId].name}</Text>
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
            <Button
              onClick={() => {
                setHarvestModalStatus("selectAsset");
                harvestModalDisclosure.onOpen();
              }}
              size="sm"
              colorScheme={"brand"}
              disabled={!isWagmiConnected}
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
                    {asset} {!isAccountTokenAmountEnough && "( Not Enough )"}
                  </Button>
                </Stack>
              )}
              {harvestModalStatus === "selectNetwork" && (
                <Stack spacing="8">
                  <FormControl>
                    <RadioGroup onChange={setSelectedChainIdWithTypeCheck} value={selectedChainId}>
                      <Stack spacing="4">
                        {Object.entries(networkJsonFile).map(([chainId, value]) => {
                          return (
                            <Radio key={chainId} value={chainId}>
                              {value.name}
                            </Radio>
                          );
                        })}
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputHarvestAmount}
                      onClick={() => setHarvestModalStatus("selectAsset")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputHarvestAmount}
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
                      <Text fontSize="sm">
                        {inputHarvestAmount} {asset}
                      </Text>
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
                      <Text fontSize="sm">{networkJsonFile[selectedChainId].name}</Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"medium"}>
                        Target Chain
                      </Text>
                      <Text fontSize="sm">{networkJsonFile[selectedChainId].name}</Text>
                    </Stack>
                  </Stack>
                  <HStack>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputHarvestAmount}
                      onClick={() => setPlantModalStatus("selectNetwork")}
                    >
                      Back
                    </Button>
                    <Button
                      w="full"
                      boxShadow={"md"}
                      borderRadius="2xl"
                      fontSize="sm"
                      disabled={!inputHarvestAmount}
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
          <Unit header="Farm Detail" bgColor={"green.500"} color={"white"}>
            <Flex justify="right"></Flex>
          </Unit>
        </Stack>
      </Unit>
    </DefaultLayout>
  );
};

export default HomePage;

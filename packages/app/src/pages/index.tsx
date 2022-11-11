import {
  Box,
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
import { useAccount } from "wagmi";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";
import { useAccountTokenAmount } from "@/hooks/useAccountTokenAmount";
import { useAPY } from "@/hooks/useAPY";
import { useChainId } from "@/hooks/useChainId";
import { useContracts } from "@/hooks/useContracts";
import { useIsWagmiConnected } from "@/hooks/useIsWagmiConnected";

import networkJsonFile from "../../../contracts/network.json";
import { ChainId, isChainId } from "../../../contracts/types/ChainId";

const HomePage: NextPage = () => {
  const { chainId } = useChainId();
  const contracts = useContracts();
  const { address: userAddress } = useAccount();

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
  const [inputPlantAmount, setInputPlantAmount] = useState("0.1");
  const [inputHarvestAmount, setInputHarvestAmount] = useState("0.1");
  const [selectedChainId, setSelectedChainId] = useState<ChainId>("5");
  const [isStaked, setIsStaked] = useState(false);

  const setSelectedChainIdWithTypeCheck = (chainId: string) => {
    if (!isChainId(chainId)) {
      return;
    }
    setSelectedChainId(chainId);
  };

  const plant = async () => {
    if (!contracts || !userAddress) {
      return;
    }
    try {
      const parsedInputAmount = ethers.utils.parseUnits(inputPlantAmount, 6);
      if (chainId === selectedChainId) {
        console.log("plant without crosschain bridge");
        const allowance = await contracts.token.allowance(userAddress, contracts.vault.address);
        console.log("allowance", allowance);
        if (allowance.lt(parsedInputAmount)) {
          console.log("allowance is not enough, please approve");
          const approveTx = await contracts.token.approve(contracts.vault.address, parsedInputAmount);
          console.log("approve tx sent", approveTx.hash);
          await approveTx.wait();
          console.log("approve tx confirmed");
        }
        console.log("please stake");
        const stakeTx = await contracts.vault.deposit(parsedInputAmount);
        console.log("stake tx sent", stakeTx.hash);
        await stakeTx.wait();
        console.log("stake tx confirmed");
      } else {
        console.log("plant with crosschain bridge");
        const allowance = await contracts.token.allowance(userAddress, contracts.crossFarm.address);
        console.log("allowance", allowance);
        if (allowance.lt(parsedInputAmount)) {
          console.log("allowance is not enough, please approve");
          const approveTx = await contracts.token.approve(contracts.crossFarm.address, parsedInputAmount);
          console.log("approve tx sent", approveTx.hash);
          await approveTx.wait();
          console.log("approve tx confirmed");
        }
        await contracts.crossFarm.process(
          "0",
          networkJsonFile[selectedChainId].key,
          networkJsonFile[selectedChainId].deployments.crossFarm,
          asset,
          parsedInputAmount,
          networkJsonFile[selectedChainId].deployments.vault
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DefaultLayout>
      <Unit header="CrossFarm" description="Auto crosschain yield aggregator with Axeler">
        <Stack>
          <Flex justify="space-between">
            <Button
              fontWeight={"bold"}
              onClick={() => {
                setPlantModalStatus("selectAsset");
                fetchAccountTokenAmount();
                plantModalDisclosure.onOpen();
              }}
              colorScheme={"brand"}
              disabled={!isWagmiConnected}
            >
              Plant
            </Button>
            <Button
              fontWeight={"bold"}
              onClick={() => {
                setHarvestModalStatus("selectAsset");
                harvestModalDisclosure.onOpen();
              }}
              colorScheme={"brand"}
              disabled={!isStaked}
            >
              Harvest
            </Button>
          </Flex>
          <Box py="12">
            <Center h="200" position="relative">
              <Image src="/img/base.png" alt="base" h="200" position="absolute" top="0" />
              {isStaked && <Image src="/img/corn.png" alt="corn" h="12" position="absolute" top="10" />}
            </Center>
          </Box>
        </Stack>
      </Unit>
      <Modal header="Plant" isOpen={plantModalDisclosure.isOpen} onClose={plantModalDisclosure.onClose}>
        {plantModalStatus === "selectAsset" && (
          <Stack spacing="4">
            <Button
              fontWeight={"bold"}
              isLoading={isAccountTokenAmountLoading}
              loadingText={"Loading"}
              disabled={!isAccountTokenAmountEnough}
              onClick={() => setPlantModalStatus("inputAmount")}
            >
              {asset} {!isAccountTokenAmountEnough ? "( Not Enough )" : `( ${accountTokenAmount} )`} {}
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
                fontWeight={"bold"}
                w="full"
                disabled={!inputPlantAmount}
                onClick={() => setPlantModalStatus("selectAsset")}
              >
                Back
              </Button>
              <Button
                fontWeight={"bold"}
                w="full"
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
              <Button fontWeight={"bold"} w="full" onClick={() => setPlantModalStatus("inputAmount")}>
                Back
              </Button>
              <Button fontWeight={"bold"} w="full" onClick={() => setPlantModalStatus("preview")} colorScheme="brand">
                Next
              </Button>
            </HStack>
          </Stack>
        )}
        {plantModalStatus === "preview" && (
          <Stack spacing="8">
            <Stack spacing="2">
              <Stack spacing="1">
                <Text fontSize="sm" fontWeight={"bold"}>
                  Amount
                </Text>
                <Text fontSize="sm">{inputPlantAmount} aUSDC</Text>
              </Stack>
              <Stack spacing="1">
                <Text fontSize="sm" fontWeight={"bold"}>
                  Source Chain
                </Text>
                <Text fontSize="sm">{chainId && networkJsonFile[chainId].name}</Text>
              </Stack>
              {chainId !== selectedChainId && (
                <>
                  <Stack spacing="1">
                    <Text fontSize="sm" fontWeight={"bold"}>
                      Target Chain
                    </Text>
                    <Text fontSize="sm">{networkJsonFile[selectedChainId].name}</Text>
                  </Stack>
                  <Stack spacing="1">
                    <Text fontSize="sm" fontWeight={"bold"}>
                      Bridge Protocol
                    </Text>
                    <Text fontSize="sm">Axelar</Text>
                  </Stack>
                </>
              )}
              <Stack spacing="1">
                <Text fontSize="sm" fontWeight={"bold"}>
                  Expected APY
                </Text>
                <Text fontSize="sm">{apy[selectedChainId]}%</Text>
              </Stack>
            </Stack>
            <HStack>
              <Button fontWeight={"bold"} w="full" onClick={() => setPlantModalStatus("selectNetwork")}>
                Back
              </Button>
              <Button
                fontWeight={"bold"}
                w="full"
                onClick={async () => {
                  await plant();
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

      <Modal header="Harvest" isOpen={harvestModalDisclosure.isOpen} onClose={harvestModalDisclosure.onClose}>
        {harvestModalStatus === "selectAsset" && (
          <Stack spacing="4">
            <Button
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
                fontWeight={"bold"}
                w="full"
                disabled={!inputHarvestAmount}
                onClick={() => setHarvestModalStatus("selectAsset")}
              >
                Back
              </Button>
              <Button
                fontWeight={"bold"}
                w="full"
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
                <Text fontSize="sm" fontWeight={"bold"}>
                  Amount
                </Text>
                <Text fontSize="sm">
                  {inputHarvestAmount} {asset}
                </Text>
              </Stack>
              <Stack spacing="1">
                <Text fontSize="sm" fontWeight={"bold"}>
                  Bridge Protocol
                </Text>
                <Text fontSize="sm">Axelar</Text>
              </Stack>
              <Stack spacing="1">
                <Text fontSize="sm" fontWeight={"bold"}>
                  Source Chain
                </Text>
                <Text fontSize="sm">{networkJsonFile[selectedChainId].name}</Text>
              </Stack>
              <Stack spacing="1">
                <Text fontSize="sm" fontWeight={"bold"}>
                  Target Chain
                </Text>
                <Text fontSize="sm">{networkJsonFile[selectedChainId].name}</Text>
              </Stack>
            </Stack>
            <HStack>
              <Button
                fontWeight={"bold"}
                w="full"
                disabled={!inputHarvestAmount}
                onClick={() => setPlantModalStatus("selectNetwork")}
              >
                Back
              </Button>
              <Button
                fontWeight={"bold"}
                w="full"
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
    </DefaultLayout>
  );
};

export default HomePage;

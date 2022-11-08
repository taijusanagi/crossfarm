import { Button, useDisclosure } from "@chakra-ui/react";
import { NextPage } from "next";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";

const HomePage: NextPage = () => {
  const modalDisclosure = useDisclosure();

  return (
    <DefaultLayout>
      <Button onClick={modalDisclosure.onOpen} colorScheme="brand">
        Open
      </Button>
      <Modal header="modal" isOpen={modalDisclosure.isOpen} onClose={modalDisclosure.onClose}>
        Content
      </Modal>
      <Unit header="Header" description="Description">
        Dhildren
      </Unit>
    </DefaultLayout>
  );
};

export default HomePage;

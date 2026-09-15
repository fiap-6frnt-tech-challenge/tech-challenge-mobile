import type { Meta, StoryObj } from '@storybook/react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AttachmentList, type AttachmentItem } from './AttachmentList';
import { Text } from './Text';

const IMAGE_URL = 'https://picsum.photos/id/1080/1200/800';

const image: AttachmentItem = {
  id: 'att-1',
  name: 'comprovante-mercado.jpg',
  size: 812_344,
  mimeType: 'image/jpeg',
  url: IMAGE_URL,
  path: 'receipts/uid/tx/comprovante-mercado.jpg',
  status: 'ready',
};

const pdf: AttachmentItem = {
  id: 'att-2',
  name: 'nota-fiscal.pdf',
  size: 1_258_291,
  mimeType: 'application/pdf',
  url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  path: 'receipts/uid/tx/nota-fiscal.pdf',
  status: 'ready',
};

const uploading: AttachmentItem = {
  id: 'att-3',
  name: 'recibo-aluguel.pdf',
  size: 2_411_724,
  mimeType: 'application/pdf',
  uri: 'file:///mock/recibo-aluguel.pdf',
  status: 'uploading',
  progress: 45,
};

const failed: AttachmentItem = {
  id: 'att-4',
  name: 'extrato.pdf',
  size: 5_242_880,
  mimeType: 'application/pdf',
  status: 'error',
  errorMessage: 'Arquivo maior que 5 MB',
};

function AttachmentListDemo({
  initial,
  readonly,
}: {
  initial: AttachmentItem[];
  readonly?: boolean;
}) {
  const [attachments, setAttachments] = useState(initial);

  return (
    <View style={{ gap: 8 }}>
      <AttachmentList
        attachments={attachments}
        readonly={readonly}
        onRemove={(attachment) =>
          setAttachments((current) => current.filter((item) => item.id !== attachment.id))
        }
      />
      {attachments.length === 0 ? (
        <Text variant="caption" color="textSecondary">
          Nenhum anexo
        </Text>
      ) : null}
    </View>
  );
}

function UploadingDemo() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setProgress((value) => (value >= 100 ? 0 : value + 5)), 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <AttachmentList
      attachments={[
        { ...uploading, progress },
        { ...image, id: 'att-5', progress: 100 },
      ]}
      onRemove={() => {}}
    />
  );
}

const meta = {
  title: 'ui/AttachmentList',
  component: AttachmentList,
  args: { attachments: [image, pdf] },
} satisfies Meta<typeof AttachmentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageAttachment: Story = {
  args: { attachments: [image] },
};

export const PdfAttachment: Story = {
  args: { attachments: [pdf] },
};

export const Uploading: Story = {
  args: { attachments: [uploading] },
  render: () => <UploadingDemo />,
};

export const UploadError: Story = {
  args: { attachments: [failed] },
};

export const Readonly: Story = {
  args: { attachments: [image, pdf], readonly: true },
};

export const Removable: Story = {
  args: { attachments: [image, pdf] },
  render: () => <AttachmentListDemo initial={[image, pdf, failed]} />,
};

export const AllStates: Story = {
  args: { attachments: [] },
  render: () => (
    <View style={{ gap: 24, padding: 16 }}>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Imagem — thumbnail, toque abre o preview em tela cheia
        </Text>
        <AttachmentList attachments={[image]} onRemove={() => {}} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          PDF — ícone, toque abre no visualizador externo
        </Text>
        <AttachmentList attachments={[pdf]} onRemove={() => {}} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Upload em progresso — barra + porcentagem
        </Text>
        <UploadingDemo />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Falha no envio
        </Text>
        <AttachmentList attachments={[failed]} onRemove={() => {}} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Readonly — sem botão remover
        </Text>
        <AttachmentList attachments={[image, pdf]} readonly onRemove={() => {}} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Interativo — remover tira o item da lista
        </Text>
        <AttachmentListDemo initial={[image, pdf]} />
      </View>
    </View>
  ),
};

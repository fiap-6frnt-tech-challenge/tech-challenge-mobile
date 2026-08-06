import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AttachmentPicker,
  type AttachmentPickerProps,
  type PickedAttachment,
} from './AttachmentPicker';
import type { AttachmentSource, PickResult } from './AttachmentPicker.source';
import { Chip } from './Chip';
import { Text } from './Text';

function mockSource(overrides: Partial<AttachmentSource> = {}): AttachmentSource {
  const photo: PickResult = {
    status: 'picked',
    attachment: {
      uri: 'file:///mock/IMG_0042.jpg',
      name: 'IMG_0042.jpg',
      contentType: 'image/jpeg',
      size: 812_344,
    },
  };
  const pdf: PickResult = {
    status: 'picked',
    attachment: {
      uri: 'file:///mock/comprovante.pdf',
      name: 'comprovante.pdf',
      contentType: 'application/pdf',
      size: 154_233,
    },
  };

  return {
    pickFromCamera: async () => photo,
    pickFromLibrary: async () => photo,
    pickDocument: async () => pdf,
    ...overrides,
  };
}

const deniedCamera = mockSource({
  pickFromCamera: async () => ({
    status: 'denied',
    message: 'Permissão de câmera negada. Habilite o acesso nos ajustes do dispositivo.',
  }),
});

const allDenied: AttachmentSource = {
  pickFromCamera: async () => ({ status: 'denied', message: 'Permissão de câmera negada.' }),
  pickFromLibrary: async () => ({ status: 'denied', message: 'Permissão de galeria negada.' }),
  pickDocument: async () => ({ status: 'canceled' }),
};

const alwaysCanceled: AttachmentSource = {
  pickFromCamera: async () => ({ status: 'canceled' }),
  pickFromLibrary: async () => ({ status: 'canceled' }),
  pickDocument: async () => ({ status: 'canceled' }),
};

function formatSize(bytes?: number) {
  if (bytes === undefined) return 'tamanho desconhecido';
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function AttachmentPickerDemo(props: Omit<AttachmentPickerProps, 'onPick'>) {
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);

  return (
    <View style={{ gap: 12 }}>
      <AttachmentPicker
        {...props}
        onPick={(attachment) => setAttachments((current) => [...current, attachment])}
      />

      {attachments.length > 0 ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {attachments.map((attachment, index) => (
              <Chip
                key={`${attachment.uri}-${index}`}
                label={attachment.name}
                onRemove={() => setAttachments((current) => current.filter((_, i) => i !== index))}
              />
            ))}
          </View>
          {attachments.map((attachment, index) => (
            <Text key={`${attachment.uri}-meta-${index}`} variant="caption" color="textSecondary">
              {attachment.contentType} · {formatSize(attachment.size)} · {attachment.uri}
            </Text>
          ))}
        </View>
      ) : (
        <Text variant="caption" color="textSecondary">
          Nenhum anexo selecionado
        </Text>
      )}
    </View>
  );
}

const meta = {
  title: 'ui/AttachmentPicker',
  component: AttachmentPickerDemo,
  args: { source: mockSource() },
} satisfies Meta<typeof AttachmentPickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const PermissionDenied: Story = {
  args: { source: deniedCamera },
};

export const Canceled: Story = {
  args: { source: alwaysCanceled },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 24, padding: 16 }}>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Normal — foto (câmera/galeria) e PDF com metadados
        </Text>
        <AttachmentPickerDemo source={mockSource()} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Permissão negada — mensagem anunciada pelo leitor de tela
        </Text>
        <AttachmentPickerDemo source={allDenied} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Cancelado pelo usuário — nada é emitido
        </Text>
        <AttachmentPickerDemo source={alwaysCanceled} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Desabilitado
        </Text>
        <AttachmentPickerDemo source={mockSource()} disabled />
      </View>
    </View>
  ),
};

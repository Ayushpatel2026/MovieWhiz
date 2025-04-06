import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';

export const pickAudioFile = async (): Promise<DocumentPickerResponse | null> => {
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.audio],
    });
    if (res && res.length > 0) {
      return res[0];
    }
		return null;
  } catch (err: any) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker
    } else {
      console.error('Error picking audio file:', err);
    }
    return null;
  }
};
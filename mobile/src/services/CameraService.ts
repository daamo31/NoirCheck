import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export interface CameraResult {
  uri: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64?: string;
}

export interface CameraPermissions {
  camera: boolean;
  mediaLibrary: boolean;
}

class CameraService {
  // Verificar y solicitar permisos
  async requestPermissions(): Promise<CameraPermissions> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {
        camera: false,
        mediaLibrary: false,
      };
    }
  }

  // Verificar permisos actuales
  async checkPermissions(): Promise<CameraPermissions> {
    try {
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync();

      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        camera: false,
        mediaLibrary: false,
      };
    }
  }

  // Capturar foto con la cámara
  async capturePhoto(options?: {
    includeBase64?: boolean;
    quality?: number;
  }): Promise<CameraResult | null> {
    try {
      const permissions = await this.checkPermissions();
      
      if (!permissions.camera) {
        const granted = await this.requestPermissions();
        if (!granted.camera) {
          Alert.alert(
            'Permiso necesario',
            'Se necesita acceso a la cámara para capturar fotos.'
          );
          return null;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: options?.quality || 0.8,
        base64: options?.includeBase64 || false,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'image',
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        fileSize: asset.fileSize || 0,
        mimeType: asset.type || 'image/jpeg',
        base64: asset.base64 || undefined,
      };
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'No se pudo capturar la foto.');
      return null;
    }
  }

  // Capturar video con la cámara
  async captureVideo(options?: {
    maxDuration?: number;
    quality?: number;
  }): Promise<CameraResult | null> {
    try {
      const permissions = await this.checkPermissions();
      
      if (!permissions.camera) {
        const granted = await this.requestPermissions();
        if (!granted.camera) {
          Alert.alert(
            'Permiso necesario',
            'Se necesita acceso a la cámara para grabar videos.'
          );
          return null;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: options?.maxDuration || 60,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'video',
        fileName: asset.fileName || `video_${Date.now()}.mp4`,
        fileSize: asset.fileSize || 0,
        mimeType: asset.type || 'video/mp4',
      };
    } catch (error) {
      console.error('Error capturing video:', error);
      Alert.alert('Error', 'No se pudo grabar el video.');
      return null;
    }
  }

  // Seleccionar desde galería
  async pickFromGallery(options?: {
    mediaTypes?: ImagePicker.MediaTypeOptions;
    allowsEditing?: boolean;
    includeBase64?: boolean;
    quality?: number;
    allowsMultipleSelection?: boolean;
  }): Promise<CameraResult[] | null> {
    try {
      const permissions = await this.checkPermissions();
      
      if (!permissions.mediaLibrary) {
        const granted = await this.requestPermissions();
        if (!granted.mediaLibrary) {
          Alert.alert(
            'Permiso necesario',
            'Se necesita acceso a la galería para seleccionar archivos.'
          );
          return null;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options?.mediaTypes || ImagePicker.MediaTypeOptions.All,
        allowsEditing: options?.allowsEditing !== false,
        aspect: [4, 3],
        quality: options?.quality || 0.8,
        base64: options?.includeBase64 || false,
        allowsMultipleSelection: options?.allowsMultipleSelection || false,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        fileName: asset.fileName || `file_${Date.now()}`,
        fileSize: asset.fileSize || 0,
        mimeType: asset.type || 'image/jpeg',
        base64: asset.base64 || undefined,
      }));
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
      return null;
    }
  }

  // Guardar archivo en galería
  async saveToGallery(uri: string): Promise<boolean> {
    try {
      const permissions = await this.checkPermissions();
      
      if (!permissions.mediaLibrary) {
        const granted = await this.requestPermissions();
        if (!granted.mediaLibrary) {
          Alert.alert(
            'Permiso necesario',
            'Se necesita acceso a la galería para guardar archivos.'
          );
          return false;
        }
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      
      if (asset) {
        Alert.alert('Éxito', 'Archivo guardado en la galería.');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'No se pudo guardar el archivo.');
      return false;
    }
  }

  // Obtener información de un archivo
  async getFileInfo(uri: string): Promise<{
    size: number;
    exists: boolean;
    modificationTime: number;
    isDirectory: boolean;
  } | null> {
    try {
      const { FileSystem } = require('expo-file-system');
      const info = await FileSystem.getInfoAsync(uri);
      return info;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  // Mostrar opciones de selección
  showSelectionOptions(onCamera: () => void, onGallery: () => void) {
    Alert.alert(
      'Seleccionar archivo',
      'Elige cómo quieres seleccionar tu contenido',
      [
        {
          text: 'Cámara',
          onPress: onCamera,
        },
        {
          text: 'Galería',
          onPress: onGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }

  // Validar tipo de archivo
  isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => mimeType.includes(type));
  }

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const cameraService = new CameraService();
export default CameraService;

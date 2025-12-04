/**
 * Google Cloud Credentials Helper
 * 
 * Para reduzir o tamanho das variáveis de ambiente,
 * use variáveis individuais em vez de um JSON grande
 */

interface GoogleCredentials {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
}

/**
 * Obtém as credenciais do Google Cloud
 * 
 * Suporta dois métodos:
 * 1. JSON completo via GOOGLE_CLOUD_CREDENTIALS (desenvolvimento)
 * 2. Variáveis individuais (produção - Netlify)
 */
export function getGoogleCloudCredentials(): GoogleCredentials | null {
  // Método 1: Tentar usar variáveis individuais (preferido para produção)
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID

  if (privateKey && clientEmail && projectId) {
    // Construir credenciais a partir de variáveis individuais
    return {
      type: 'service_account',
      project_id: projectId,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
      private_key: privateKey.replace(/\\n/g, '\n'), // Converter \n para quebras de linha reais
      client_email: clientEmail,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL || `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
    }
  }

  // Método 2: Fallback para JSON completo (desenvolvimento)
  const credentialsJson = process.env.GOOGLE_CLOUD_CREDENTIALS
  if (credentialsJson) {
    try {
      const credentials = JSON.parse(credentialsJson)
      
      // Validar campos obrigatórios
      if (!credentials.type || !credentials.project_id || !credentials.private_key || !credentials.client_email) {
        console.error('Credenciais incompletas do Google Cloud')
        return null
      }
      
      return credentials
    } catch (error) {
      console.error('Erro ao fazer parse das credenciais do Google Cloud:', error)
      return null
    }
  }

  console.error('Credenciais do Google Cloud não configuradas')
  return null
}

/**
 * Verifica se as credenciais do Google Cloud estão disponíveis
 */
export function hasGoogleCloudCredentials(): boolean {
  return getGoogleCloudCredentials() !== null
}


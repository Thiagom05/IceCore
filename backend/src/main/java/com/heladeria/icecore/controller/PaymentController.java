package com.heladeria.icecore.controller;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    @PostMapping("/create_preference")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, String>> createPreference(@RequestBody List<Map<String, Object>> items) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            List<PreferenceItemRequest> preferenceItems = new ArrayList<>();

            for (Map<String, Object> item : items) {
                // Parse item data from Frontend
                // Structure: { product: { nombre: "..." }, price: 1000, gustos: [...] }

                Map<String, Object> product = (Map<String, Object>) item.get("product");
                String title = (String) product.get("nombre");

                // Add gustos info to title if present
                List<Map<String, Object>> gustos = (List<Map<String, Object>>) item.get("gustos");
                if (gustos != null && !gustos.isEmpty()) {
                    title += " (Con gustos)";
                }

                Number price = (Number) item.get("price");

                PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                        .title(title)
                        .quantity(1)
                        .unitPrice(new BigDecimal(price.toString()))
                        .currencyId("ARS")
                        .build();

                preferenceItems.add(itemRequest);
            }

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:5173/success")
                    .failure("http://localhost:5173/failure")
                    .pending("http://localhost:5173/pending")
                    .build();

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(preferenceItems)
                    .backUrls(backUrls)
                    // .autoReturn("approved")
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return ResponseEntity.ok(Map.of("init_point", preference.getInitPoint()));

        } catch (com.mercadopago.exceptions.MPApiException apiException) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", apiException.getApiResponse().getContent(), "code",
                            String.valueOf(apiException.getStatusCode())));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage(), "trace", e.getStackTrace()[0].toString()));
        }
    }
}

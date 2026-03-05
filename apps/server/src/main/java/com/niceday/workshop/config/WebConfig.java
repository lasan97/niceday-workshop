package com.niceday.workshop.config;

import com.niceday.workshop.auth.WorkshopAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final WorkshopAuthInterceptor workshopAuthInterceptor;

    public WebConfig(WorkshopAuthInterceptor workshopAuthInterceptor) {
        this.workshopAuthInterceptor = workshopAuthInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3001", "http://192.168.0.21:3000", "http://192.168.0.21:3001")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(workshopAuthInterceptor)
                .addPathPatterns("/api/v1/workshop/**");
    }
}
